import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Brain, Play, Square, AlertCircle } from "lucide-react";
import { useApi, useTrainingPolling } from "@/hooks/useApi";
import { apiService, Dataset, TrainingJob, TrainingRequest } from "@/services/api";

const ALGORITHMS = [
  { value: "logistic_regression", label: "Logistic Regression", params: { max_iter: 1000, random_state: 42, solver: "liblinear" } },
  { value: "svm", label: "Support Vector Machine", params: { C: 1.0, kernel: "rbf", random_state: 42 } },
  { value: "random_forest", label: "Random Forest", params: { n_estimators: 100, random_state: 42, max_depth: 10 } },
  { value: "decision_tree", label: "Decision Tree", params: { random_state: 42, max_depth: 10 } },
  { value: "gradient_boosting", label: "Gradient Boosting", params: { n_estimators: 100, random_state: 42, learning_rate: 0.1 } },
];

export default function Training() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<string>("");
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>("");
  const [testSize, setTestSize] = useState([0.2]);
  const [hyperparams, setHyperparams] = useState<Record<string, any>>({});
  const [currentJob, setCurrentJob] = useState<TrainingJob | null>(null);
  const [trainingLogs, setTrainingLogs] = useState<string[]>([]);

  const datasetsApi = useApi<Dataset[]>();
  const trainingApi = useApi<TrainingJob>();
  const { isPolling, startPolling, stopPolling } = useTrainingPolling();

  useEffect(() => {
    loadDatasets();
  }, []);

  useEffect(() => {
    // Set default hyperparameters when algorithm changes
    const algorithm = ALGORITHMS.find(a => a.value === selectedAlgorithm);
    if (algorithm) {
      setHyperparams(algorithm.params);
    }
  }, [selectedAlgorithm]);

  const loadDatasets = async () => {
    await datasetsApi.execute(() => apiService.getDatasets(), {
      onSuccess: (data) => {
        setDatasets(data);
        if (data.length > 0 && !selectedDataset) {
          setSelectedDataset(data[0].id);
        }
      },
    });
  };

  const handleStartTraining = async () => {
    if (!selectedDataset || !selectedAlgorithm) return;

    const request: TrainingRequest = {
      dataset_id: selectedDataset,
      algorithm: selectedAlgorithm,
      params: hyperparams,
      test_size: testSize[0],
      random_state: 42,
    };

    await trainingApi.execute(
      () => apiService.startTraining(request),
      {
        onSuccess: (job) => {
          setCurrentJob(job);
          setTrainingLogs([]);
          startPolling(
            job.job_id,
            (updatedJob) => {
              setCurrentJob(updatedJob);
              if (updatedJob.logs) {
                setTrainingLogs(updatedJob.logs);
              }
            },
            (finalJob) => {
              setCurrentJob(finalJob);
              if (finalJob.logs) {
                setTrainingLogs(finalJob.logs);
              }
            }
          );
        },
        showSuccessToast: true,
        successMessage: "Training started successfully!",
      }
    );
  };

  const handleStopTraining = () => {
    stopPolling();
    setCurrentJob(null);
  };

  const updateHyperparam = (key: string, value: any) => {
    setHyperparams(prev => ({ ...prev, [key]: value }));
  };

  const selectedDatasetInfo = datasets.find(d => d.id === selectedDataset);
  const selectedAlgorithmInfo = ALGORITHMS.find(a => a.value === selectedAlgorithm);
  const canStartTraining = selectedDataset && selectedAlgorithm && !isPolling;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Training</h1>
        <p className="text-muted-foreground">
          Train machine learning models on your datasets with customizable parameters.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Training Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Training Configuration
            </CardTitle>
            <CardDescription>
              Select your dataset, algorithm, and configure training parameters.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Dataset Selection */}
            <div className="space-y-2">
              <Label>Dataset</Label>
              <Select value={selectedDataset} onValueChange={setSelectedDataset}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a dataset" />
                </SelectTrigger>
                <SelectContent>
                  {datasets.map((dataset) => (
                    <SelectItem key={dataset.id} value={dataset.id}>
                      {dataset.name} ({dataset.rows} rows, {dataset.columns} cols)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedDatasetInfo && (
                <div className="text-sm text-muted-foreground">
                  Target column: {selectedDatasetInfo.target_column || "Not specified"}
                </div>
              )}
            </div>

            {/* Algorithm Selection */}
            <div className="space-y-2">
              <Label>Algorithm</Label>
              <Select value={selectedAlgorithm} onValueChange={setSelectedAlgorithm}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an algorithm" />
                </SelectTrigger>
                <SelectContent>
                  {ALGORITHMS.map((algorithm) => (
                    <SelectItem key={algorithm.value} value={algorithm.value}>
                      {algorithm.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Test Size */}
            <div className="space-y-2">
              <Label>Test Size: {testSize[0]}</Label>
              <Slider
                value={testSize}
                onValueChange={setTestSize}
                max={0.5}
                min={0.1}
                step={0.05}
                className="w-full"
              />
              <div className="text-sm text-muted-foreground">
                Proportion of data used for testing
              </div>
            </div>

            {/* Hyperparameters */}
            {selectedAlgorithmInfo && (
              <div className="space-y-4">
                <Label>Hyperparameters</Label>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(selectedAlgorithmInfo.params).map(([key, defaultValue]) => {
                    const isStringParam = typeof defaultValue === 'string';
                    const isNumberParam = typeof defaultValue === 'number';
                    
                    return (
                      <div key={key} className="space-y-1">
                        <Label className="text-sm">{key.replace('_', ' ')}</Label>
                        {isStringParam ? (
                          <Select
                            value={hyperparams[key] !== undefined ? hyperparams[key] : defaultValue}
                            onValueChange={(value) => updateHyperparam(key, value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {key === 'solver' && (
                                <>
                                  <SelectItem value="liblinear">liblinear</SelectItem>
                                  <SelectItem value="lbfgs">lbfgs</SelectItem>
                                  <SelectItem value="newton-cg">newton-cg</SelectItem>
                                  <SelectItem value="sag">sag</SelectItem>
                                </>
                              )}
                              {key === 'kernel' && (
                                <>
                                  <SelectItem value="rbf">rbf</SelectItem>
                                  <SelectItem value="linear">linear</SelectItem>
                                  <SelectItem value="poly">poly</SelectItem>
                                  <SelectItem value="sigmoid">sigmoid</SelectItem>
                                </>
                              )}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            type="number"
                            value={hyperparams[key] !== undefined ? hyperparams[key] : defaultValue}
                            onChange={(e) => {
                              const value = e.target.value;
                              const numValue = parseFloat(value);
                              updateHyperparam(key, isNaN(numValue) ? defaultValue : numValue);
                            }}
                            step={key === "learning_rate" ? 0.01 : key.includes("iter") || key.includes("estimators") ? 1 : 0.1}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Training Controls */}
            <div className="flex space-x-2">
              <Button
                onClick={handleStartTraining}
                disabled={!canStartTraining || trainingApi.loading}
                className="flex-1"
              >
                <Play className="h-4 w-4 mr-2" />
                {trainingApi.loading ? "Starting..." : "Start Training"}
              </Button>
              {isPolling && (
                <Button variant="outline" onClick={handleStopTraining}>
                  <Square className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Training Status & Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Training Status</CardTitle>
            <CardDescription>
              Monitor your training progress and view logs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentJob ? (
              <>
                <div className="flex items-center justify-between">
                  <span>Job ID: {currentJob.job_id}</span>
                  <Badge 
                    variant={
                      currentJob.status === 'finished' ? 'default' :
                      currentJob.status === 'running' ? 'secondary' :
                      currentJob.status === 'failed' ? 'destructive' :
                      'outline'
                    }
                  >
                    {currentJob.status.toUpperCase()}
                  </Badge>
                </div>

                {currentJob.progress !== undefined && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{Math.round(currentJob.progress)}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(currentJob.progress, 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {trainingLogs.length > 0 && (
                  <div className="space-y-2">
                    <Label>Training Logs</Label>
                    <div className="bg-muted rounded-lg p-3 max-h-64 overflow-y-auto font-mono text-sm">
                      {trainingLogs.map((log, index) => (
                        <div key={index} className="text-muted-foreground">
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center p-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">No active training</p>
                <p className="text-muted-foreground">
                  Configure your training parameters and start a new training job.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}