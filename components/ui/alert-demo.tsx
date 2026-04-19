import { Alert, AlertContent, AlertDescription, AlertIcon, AlertTitle } from '@/components/ui/alert-1';
import { AlertCircle, Terminal } from 'lucide-react';

export default function AlertDemo() {
  return (
     <div className="flex flex-col gap-5 p-10 w-full mx-auto max-w-[600px] h-screen justify-center items-center bg-black">
      <Alert variant="primary" close={true}>
        <AlertIcon>
          <Terminal className="h-4 w-4" />
        </AlertIcon>
        <AlertContent>
          <AlertTitle>Example Alert Title</AlertTitle>
          <AlertDescription>
            Insert the alert description here. It would look better as two lines of text.
          </AlertDescription>
        </AlertContent>
      </Alert>
      <Alert variant="destructive" appearance="light" close={true}>
        <AlertIcon>
          <AlertCircle className="h-4 w-4" />
        </AlertIcon>
        <AlertContent>
          <AlertTitle>Critical Anomaly Detected</AlertTitle>
          <AlertDescription>
            Multiple sensor nodes in Sector 4 are reporting density breaches. Deployment of rapid response team recommended.
          </AlertDescription>
        </AlertContent>
      </Alert>
    </div>
  );
}
