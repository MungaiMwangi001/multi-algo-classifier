import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Target, Upload, Zap, FileSpreadsheet, RefreshCw } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { apiService, Model, PredictionResponse } from "@/services/api";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";

interface PredictionResult {
  prediction: string;
  probability: number;
  input: Record<string, any>;
}

export default function Prediction() {
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string>("");
  const [singleInput, setSingleInput] = useState<Record<string, string>>({});
  const [singleResult, setSingleResult] = useState<PredictionResult | null>(null);
  const [bulkResults, setBulkResults] = useState<PredictionResult[]>([]);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkData, setBulkData] = useState<any[]>([]);

  const modelsApi = useApi<Model[]>();
  const singlePredictionApi = useApi<PredictionResponse>();
  const bulkPredictionApi = useApi<PredictionResponse[]>();

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    await modelsApi.execute(() => apiService.getModels(), {
      onSuccess: (data) => {
        setModels(data);
        // Always set the first model as default if none is selected
        if (data.length > 0 && !selectedModelId) {
          setSelectedModelId(data[0].model_id);
        }
        // If the currently selected model is no longer available, select the first one
        if (selectedModelId && !data.find(m => m.model_id === selectedModelId)) {
          setSelectedModelId(data[0]?.model_id || "");
        }
      },
    });
  };

  const handleSinglePrediction = async () => {
    if (!selectedModelId) return;

    // Convert string inputs to appropriate types
    const typedInput = Object.entries(singleInput).reduce((acc, [key, value]) => {
      const numValue = parseFloat(value);
      acc[key] = isNaN(numValue) ? value : numValue;
      return acc;
    }, {} as Record<string, any>);

    await singlePredictionApi.execute(
      () => apiService.predict({ model_id: selectedModelId, input: typedInput }),
      {
        onSuccess: (response) => {
          setSingleResult({
            prediction: response.prediction,
            probability: response.probability,
            input: typedInput,
          });
        },
        showSuccessToast: true,
        successMessage: "Prediction completed successfully!",
      }
    );
  };

  const handleBulkFileUpload = (files: File[]) => {
    const file = files[0];
    if (!file) return;

    setBulkFile(file);

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        setBulkData(results.data as any[]);
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
      },
    });
  };

  const handleBulkPrediction = async () => {
    if (!selectedModelId || bulkData.length === 0) return;

    const predictions: PredictionResult[] = [];

    for (const row of bulkData.slice(0, 100)) { // Limit to first 100 rows
      try {
        // Convert string values to appropriate types
        const typedInput = Object.entries(row).reduce((acc, [key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            const numValue = parseFloat(value as string);
            acc[key] = isNaN(numValue) ? value : numValue;
          }
          return acc;
        }, {} as Record<string, any>);

        const response = await apiService.predict({ 
          model_id: selectedModelId, 
          input: typedInput 
        });

        predictions.push({
          prediction: response.prediction,
          probability: response.probability,
          input: typedInput,
        });
      } catch (error) {
        console.error('Prediction error for row:', row, error);
      }
    }

    setBulkResults(predictions);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleBulkFileUpload,
    accept: {
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
  });

  const selectedModel = models.find(m => m.model_id === selectedModelId);

  // Get sample feature names for the form (this would come from the dataset in a real app)
  const sampleFeatures = ['feature_1', 'feature_2', 'feature_3', 'feature_4'];

  const updateSingleInput = (feature: string, value: string) => {
    setSingleInput(prev => ({ ...prev, [feature]: value }));
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 0.8) return "text-success";
    if (probability >= 0.6) return "text-warning";
    return "text-muted-foreground";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Prediction</h1>
        <p className="text-muted-foreground">
          Make predictions using your trained models with single samples or bulk data.
        </p>
      </div>

      {/* Model Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Model Selection
          </CardTitle>
          <CardDescription>
            Choose a trained model to make predictions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Select value={selectedModelId} onValueChange={setSelectedModelId}>
                <SelectTrigger>
                  <SelectValue placeholder={models.length === 0 ? "No models available" : "Select a model for prediction"} />
                </SelectTrigger>
                <SelectContent>
                  {models.map((model) => (
                    <SelectItem key={model.model_id} value={model.model_id}>
                      {model.algorithm} - {(model.accuracy * 100).toFixed(2)}% accuracy
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadModels}
              disabled={modelsApi.loading}
            >
              <RefreshCw className={`h-4 w-4 ${modelsApi.loading ? 'animate-spin' : ''}`} />
            </Button>
            {selectedModel && (
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">{selectedModel.algorithm}</Badge>
                <Badge variant={selectedModel.accuracy > 0.8 ? "default" : "outline"}>
                  {(selectedModel.accuracy * 100).toFixed(1)}%
                </Badge>
              </div>
            )}
          </div>
          {models.length === 0 && !modelsApi.loading && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-2">
                No trained models available. Train a model first to make predictions.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/training'}
              >
                Go to Training
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prediction Interface */}
      <Tabs defaultValue="single" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="single">Single Prediction</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Prediction</TabsTrigger>
        </TabsList>

        <TabsContent value="single">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Input Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Input Features
                </CardTitle>
                <CardDescription>
                  Enter values for each feature to make a prediction.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {sampleFeatures.map((feature) => (
                    <div key={feature} className="space-y-1">
                      <Label htmlFor={feature} className="text-sm">
                        {feature.replace('_', ' ')}
                      </Label>
                      <Input
                        id={feature}
                        type="number"
                        step="any"
                        placeholder="Enter value"
                        value={singleInput[feature] || ''}
                        onChange={(e) => updateSingleInput(feature, e.target.value)}
                      />
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleSinglePrediction}
                  disabled={!selectedModelId || singlePredictionApi.loading}
                  className="w-full"
                >
                  <Target className="h-4 w-4 mr-2" />
                  {singlePredictionApi.loading ? "Predicting..." : "Make Prediction"}
                </Button>
              </CardContent>
            </Card>

            {/* Single Result */}
            <Card>
              <CardHeader>
                <CardTitle>Prediction Result</CardTitle>
                <CardDescription>
                  The model's prediction and confidence level.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {singleResult ? (
                  <div className="space-y-4">
                    <div className="text-center p-6 bg-muted/50 rounded-lg">
                      <div className="text-3xl font-bold mb-2">
                        {singleResult.prediction}
                      </div>
                      <div className={`text-lg ${getProbabilityColor(singleResult.probability)}`}>
                        {(singleResult.probability * 100).toFixed(1)}% confidence
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-2">Input Values</h4>
                      <dl className="grid grid-cols-2 gap-2 text-sm">
                        {Object.entries(singleResult.input).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <dt className="text-muted-foreground">{key}:</dt>
                            <dd className="font-mono">{String(value)}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">No prediction yet</p>
                    <p className="text-muted-foreground">
                      Fill in the input features and click "Make Prediction" to see results.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bulk">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Bulk Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Bulk Prediction
                </CardTitle>
                <CardDescription>
                  Upload a CSV file to make predictions on multiple samples.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/25 hover:border-primary/50"
                  }`}
                >
                  <input {...getInputProps()} />
                  <FileSpreadsheet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  {isDragActive ? (
                    <p>Drop the CSV file here...</p>
                  ) : (
                    <div>
                      <p className="font-medium mb-2">Upload CSV for bulk prediction</p>
                      <p className="text-sm text-muted-foreground">
                        Each row will be processed for prediction
                      </p>
                    </div>
                  )}
                </div>

                {bulkFile && (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium">File: {bulkFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {bulkData.length} rows loaded
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleBulkPrediction}
                  disabled={!selectedModelId || bulkData.length === 0 || bulkPredictionApi.loading}
                  className="w-full"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  {bulkPredictionApi.loading ? "Processing..." : "Process Bulk Predictions"}
                </Button>
              </CardContent>
            </Card>

            {/* Bulk Results */}
            <Card>
              <CardHeader>
                <CardTitle>Bulk Results</CardTitle>
                <CardDescription>
                  Predictions for uploaded data samples.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {bulkResults.length > 0 ? (
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {bulkResults.length} predictions
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto space-y-2">
                      {bulkResults.map((result, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">Sample {index + 1}</span>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">{result.prediction}</Badge>
                              <span className={`text-sm ${getProbabilityColor(result.probability)}`}>
                                {(result.probability * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {Object.entries(result.input)
                              .slice(0, 3)
                              .map(([key, value]) => `${key}: ${value}`)
                              .join(', ')}
                            {Object.keys(result.input).length > 3 && '...'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">No bulk predictions yet</p>
                    <p className="text-muted-foreground">
                      Upload a CSV file and process it to see bulk prediction results.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}