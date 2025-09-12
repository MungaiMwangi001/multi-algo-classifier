import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Settings, Server, Info, FileText, Database, Brain, Target } from "lucide-react";

export default function SettingsPage() {
  const [apiUrl, setApiUrl] = useState(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000');
  const [logs, setLogs] = useState<string[]>([
    '[INFO] Application started successfully',
    '[INFO] Connected to backend API',
    '[DEBUG] Models cache initialized',
    '[INFO] User interface loaded',
  ]);

  const handleSaveSettings = () => {
    console.log('Settings saved:', { apiUrl });
    // In a real app, this would save to localStorage or backend
  };

  const features = [
    {
      title: "Dataset Management",
      description: "Upload, preview, and manage CSV datasets",
      icon: Database,
      status: "Available",
    },
    {
      title: "Model Training",
      description: "Train multiple ML algorithms with customizable parameters",
      icon: Brain,
      status: "Available",
    },
    {
      title: "Performance Metrics",
      description: "Comprehensive evaluation with charts and metrics",
      icon: Target,
      status: "Available",
    },
    {
      title: "Bulk Predictions",
      description: "Process multiple samples via CSV upload",
      icon: FileText,
      status: "Available",
    },
  ];

  const endpoints = [
    { method: "GET", path: "/api/datasets", description: "List all datasets" },
    { method: "POST", path: "/api/datasets/upload", description: "Upload new dataset" },
    { method: "POST", path: "/api/training/start", description: "Start model training" },
    { method: "GET", path: "/api/training/status", description: "Check training status" },
    { method: "GET", path: "/api/models", description: "List trained models" },
    { method: "GET", path: "/api/models/{id}/metrics", description: "Get model metrics" },
    { method: "POST", path: "/api/predict", description: "Make predictions" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Configure your ML Studio application and view system information.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Configuration */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                API Configuration
              </CardTitle>
              <CardDescription>
                Configure the backend API connection settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-url">Backend API URL</Label>
                <Input
                  id="api-url"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="http://localhost:8000"
                />
                <p className="text-xs text-muted-foreground">
                  Base URL for the machine learning backend API
                </p>
              </div>

              <Button onClick={handleSaveSettings} className="w-full">
                Save Configuration
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Application Logs
              </CardTitle>
              <CardDescription>
                Recent application events and system messages.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg p-3 max-h-64 overflow-y-auto">
                <div className="font-mono text-sm space-y-1">
                  {logs.map((log, index) => (
                    <div key={index} className="text-muted-foreground">
                      <span className="text-xs opacity-70">
                        {new Date().toLocaleTimeString()}
                      </span>{' '}
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Application Information
              </CardTitle>
              <CardDescription>
                Version details and system information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Version:</dt>
                  <dd className="font-semibold">1.0.0</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Framework:</dt>
                  <dd className="font-semibold">React + Vite</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">UI Library:</dt>
                  <dd className="font-semibold">shadcn/ui + Tailwind</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Charts:</dt>
                  <dd className="font-semibold">Chart.js + React</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Build Date:</dt>
                  <dd className="font-semibold">{new Date().toLocaleDateString()}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Features Overview</CardTitle>
              <CardDescription>
                Available functionality in this ML Studio instance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <feature.icon className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">{feature.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {feature.description}
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary">{feature.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* API Documentation */}
      <Card>
        <CardHeader>
          <CardTitle>API Endpoints</CardTitle>
          <CardDescription>
            Available backend endpoints for integration and development.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {endpoints.map((endpoint, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Badge 
                    variant={endpoint.method === 'GET' ? 'secondary' : 'default'}
                    className="font-mono text-xs"
                  >
                    {endpoint.method}
                  </Badge>
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    {endpoint.path}
                  </code>
                </div>
                <div className="text-sm text-muted-foreground">
                  {endpoint.description}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Quick guide to using ML Studio effectively.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <ol className="space-y-2 text-sm">
              <li>
                <strong>Upload Dataset:</strong> Go to the Datasets page and upload a CSV file 
                with your training data. Make sure the first row contains column headers.
              </li>
              <li>
                <strong>Train Model:</strong> Navigate to Training, select your dataset and 
                algorithm, configure parameters, and start training.
              </li>
              <li>
                <strong>View Results:</strong> Check the Results page to analyze model 
                performance with charts and metrics.
              </li>
              <li>
                <strong>Make Predictions:</strong> Use the Prediction page to make single 
                predictions or process bulk data.
              </li>
              <li>
                <strong>Manage Models:</strong> Visit the Models page to view, compare, 
                and manage your trained models.
              </li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}