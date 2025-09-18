import Appointments from '../models/Appointments.js';

export const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointments.find();
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
