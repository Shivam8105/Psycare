import Test from "../models/Test.js";
import UserResponse from "../models/UserResponse.js";
import UserReport from "../models/UserReport.js";
// Get all tests
export const getAllTests = async (req, res) => {
  try {
    const tests = await Test.find({test_name: { $ne: "Onboarding Quiz" } }, "test_name description");
    res.json(tests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get questions for a test
export const getTestQuestions = async (req, res) => {
  try {
    const test = await Test.findById(req.params.testId);
    if (!test) return res.status(404).json({ message: "Test not found" });
    res.json(test.questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Submit test answers & calculate score
// Submit test answers & calculate score
// Submit test answers & calculate score
// controllers/TestControllers.js

/** Convert various mapping shapes into a plain object of string -> number */
function scoreMapToObject(mapping) {
  if (!mapping) return {};
  if (mapping instanceof Map) return Object.fromEntries(mapping);
  if (typeof mapping === "object") {
    // ensure keys are strings and values are numbers where possible
    const out = {};
    for (const k of Object.keys(mapping)) {
      const v = mapping[k];
      const n = Number(v);
      out[String(k)] = Number.isNaN(n) ? v : n;
    }
    return out;
  }
  return {};
}

/**
 * Calculate raw and normalized severity-aware scores.
 *
 * - test: Test document with questions (each question has options and score_mapping)
 * - answers: { questionId: number|string } (we support indices, numeric strings, or option text)
 *
 * Returns: { rawScore, rawMax, severityPercent, details[], warnings[] }
 */
function calculateScoreAndSeverity(test, answers = {}) {
  let rawScore = 0;
  let rawMax = 0;
  let severitySum = 0;
  let questionCount = 0;
  const details = [];
  const warnings = [];

  // test-level direction flag (optional). If provided, used as default for questions missing their flag.
  // true = higher numeric mapped score means WORSE; false = higher numeric mapped score means BETTER
  const testLevelHigherIsWorse = test.higher_score_is_worse;

  for (const q of test.questions) {
    const qId = String(q._id);
    const rawAnswer = answers[qId]; // could be index (0), "1", or option text
    const scoreMapObj = scoreMapToObject(q.score_mapping || {});
    const mappedVals = Object.values(scoreMapObj).map(v => Number(v)).filter(v => !Number.isNaN(v));
    const minVal = mappedVals.length ? Math.min(...mappedVals) : 0;
    const maxVal = mappedVals.length ? Math.max(...mappedVals) : 0;
    const range = maxVal - minVal;

    // Determine mapped numeric value for the user's answer
    let mappedScore;
    if (rawAnswer === undefined || rawAnswer === null || rawAnswer === "") {
      mappedScore = 0;
      warnings.push({ qId, note: "No answer provided; treated as 0" });
    } else {
      // 1) If answer looks numeric (index or numeric string), try index-based lookup
      const asNumber = Number(rawAnswer);
      if (!Number.isNaN(asNumber) && String(rawAnswer).trim() !== "") {
        // try index-based key (common approach, mapping keys like "0","1",...)
        if (scoreMapObj.hasOwnProperty(String(asNumber))) {
          mappedScore = Number(scoreMapObj[String(asNumber)]);
        }
      }

      // 2) If not found by index, try option text -> find index of that option in q.options
      if (mappedScore === undefined && Array.isArray(q.options)) {
        const idx = q.options.findIndex(opt => String(opt).trim() === String(rawAnswer).trim());
        if (idx >= 0 && scoreMapObj.hasOwnProperty(String(idx))) {
          mappedScore = Number(scoreMapObj[String(idx)]);
        }
      }

      // 3) If still not found, try direct key lookup using the rawAnswer as key
      if (mappedScore === undefined && scoreMapObj.hasOwnProperty(String(rawAnswer))) {
        mappedScore = Number(scoreMapObj[String(rawAnswer)]);
      }

      // 4) Last resort: if rawAnswer itself is numeric, use it as score
      if (mappedScore === undefined) {
        if (!Number.isNaN(asNumber)) mappedScore = asNumber;
        else {
          mappedScore = 0;
          warnings.push({ qId, note: `Unable to map answer "${rawAnswer}" to score; defaulted to 0` });
        }
      }
    }

    // accumulate raw values
    rawScore += Number(mappedScore || 0);
    rawMax += maxVal;

    // compute normalized q value (0..1), where 1 corresponds to the question's maxVal
    let normalized = 0;
    if (range > 0) {
      normalized = (Number(mappedScore) - minVal) / range;
      // clamp
      normalized = Math.max(0, Math.min(1, normalized));
    } else {
      // no range -> single-value mapping; treat 0 or mappedScore/minVal appropriately
      normalized = 0;
    }

    // determine direction for this question:
    // question-level flag overrides test-level; if none present default to test-level or true (higher==worse)
    const qHasDir = (typeof q.higher_score_is_worse === "boolean");
    const qHigherIsWorse = qHasDir ? q.higher_score_is_worse
      : (typeof testLevelHigherIsWorse === "boolean" ? testLevelHigherIsWorse : true);

    // if higher is worse, severity = normalized; else severity = 1 - normalized
    const qSeverity = qHigherIsWorse ? normalized : (1 - normalized);

    severitySum += qSeverity;
    questionCount += 1;

    details.push({
      questionId: qId,
      rawAnswer,
      mappedScore: Number(mappedScore || 0),
      minVal,
      maxVal,
      normalized,
      qHigherIsWorse,
      qSeverity,
      scoreMapObj
    });
  }

  const severityPercent = questionCount > 0 ? (severitySum / questionCount) * 100 : 0;

  return {
    rawScore,
    rawMax,
    severityPercent,
    details,
    warnings
  };
}

export const submitTest = async (req, res) => {
  try {
    const { userId, answers } = req.body;
    const { testId } = req.params;

    if (!userId) return res.status(400).json({ error: "Missing userId" });
    if (!answers) return res.status(400).json({ error: "Missing answers" });

    const test = await Test.findById(testId);
    if (!test) return res.status(404).json({ error: "Test not found" });

    const { rawScore, rawMax, severityPercent, details, warnings } = calculateScoreAndSeverity(test, answers);

    // Save rawScore into report (you can store severityPercent too if you prefer)
    let report = await UserReport.findOne({ user_id: userId });
    if (!report) report = new UserReport({ user_id: userId, progress: {} });

    if (!report.progress.has(testId)) report.progress.set(testId, []);
    report.progress.get(testId).push(rawScore);
    report.last_updated = new Date();
    await report.save();

    // Determine message/links by severityPercent (you can override thresholds per-test later)
    let message, links = [];
    if (severityPercent < 40) {
      message = "You’re doing well — keep it up! 🌟";
      links.push({ label: "Explore wellbeing tips", url: "/resources" });
    } else if (severityPercent < 70) {
      message = "There are some concerns — consider monitoring or talking to our AI bot.";
      links.push({ label: "Talk to AI Chatbot", url: "/aichat" });
      links.push({ label: "Resources", url: "/resources" });
    } else {
      message = "Your responses suggest significant concerns. Please consider seeking support.";
      links.push({ label: "Talk to AI Chatbot", url: "/aichat" });
      links.push({ label: "Find Resources", url: "/resources" });
    }

    // debug logs (remove in production)
    console.log("submitTest:", { userId, testId, rawScore, rawMax, severityPercent, warnings });

    return res.json({
      message,
      rawScore,
      rawMax,
      severityPercent,
      links,
      history: report.progress.get(testId),
      details,
      warnings
    });
  } catch (err) {
    console.error("Error in submitTest:", err);
    return res.status(500).json({ error: "Error submitting test", details: err.message });
  }
};




// Get user report
export const getUserReport = async (req, res) => {
  try {
    const report = await UserReport.findOne({ user_id: req.params.userId });
    if (!report) return res.json({ progress: {} }); // return empty progress
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllUserReports = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Pagination parameters (default: page 1, 10 reports per page)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Fetch reports with pagination, sorted by creation date (newest first)
    const reports = await UserReport.find({ user_id: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    if (!reports || reports.length === 0) {
      return res.json({ message: "No reports yet" });
    }

    // Total count for client-side pagination
    const totalReports = await UserReport.countDocuments({ user_id: userId });
    const totalPages = Math.ceil(totalReports / limit);

    res.json({
      page,
      totalPages,
      totalReports,
      reports,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};