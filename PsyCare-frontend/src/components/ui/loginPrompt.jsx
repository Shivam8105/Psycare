import { Card, CardHeader, CardTitle, CardContent } from "./card";
import { Button } from "./button";
import { Link } from "react-router-dom";

const LoginPrompt = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-xl font-bold">
            Please Login
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <p className="text-muted-foreground text-center">
            You need to log in to continue using this feature.
          </p>
          <div className="flex gap-4">
            <Link to="/auth" className="w-full">
              <Button variant="default" className="w-full">
                Login
              </Button>
            </Link>
            <Link to="/auth" className="w-full">
              <Button variant="secondary" className="w-full">
                Signup
              </Button>
            </Link>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            className="mt-2 text-sm text-muted-foreground"
          >
            Cancel
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPrompt;
