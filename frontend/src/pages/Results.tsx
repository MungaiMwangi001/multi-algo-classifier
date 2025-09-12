import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Target, BarChart3, Eye } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { apiService, Model, ModelMetrics } from "@/services/api";
import { AccuracyChart } from "@/components/charts/AccuracyChart";
import { ConfusionMatrix } from "@/components/charts/ConfusionMatrix";
import { ROCChart } from "@/components/charts/ROCChart";
import { FeatureImportance } from "@/components/charts/FeatureImportance";

export default function Results() {
  const [searchParams] = useSearchParams();
  const initialModelId = searchParams.get('model');
  
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string>(initialModelId || '');
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [comparisonModels, setComparisonModels] = useState<Model[]>([]);

  const modelsApi = useApi<Model[]>();
  const metricsApi = useApi<ModelMetrics>();

  useEffect(() => {
    loadModels();
  }, []);

  useEffect(() => {
    if (selectedModelId) {
      loadMetrics(selectedModelId);
    }
  }, [selectedModelId]);

  const loadModels = async () => {
    await modelsApi.execute(() => apiService.getModels(), {
      onSuccess: (data) => {
        setModels(data);
        if (data.length > 0 && !selectedModelId) {
          setSelectedModelId(data[0].model_id);
        }
        // Load top 5 models for comparison
        setComparisonModels(data.slice(0, 5));
      },
    });
  };

  const loadMetrics = async (modelId: string) => {
    await metricsApi.execute(() => apiService.getModelMetrics(modelId), {
      onSuccess: (data) => setMetrics(data),
    });
  };

  const selectedModel = models.find(m => m.model_id === selectedModelId);
  
  const comparisonData = comparisonModels.map(model => ({
    model: model.model_id,
    accuracy: model.accuracy,
    algorithm: model.algorithm,
  }));

  // Calculate AUC from ROC data (simple trapezoidal rule)
  const calculateAUC = (fpr: number[], tpr: number[]) => {
    let auc = 0;
    for (let i = 1; i < fpr.length; i++) {
      auc += (fpr[i] - fpr[i-1]) * (tpr[i] + tpr[i-1]) / 2;
    }
    return auc;
  };

  const auc = metrics ? calculateAUC(metrics.fpr, metrics.tpr) : undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Results & Evaluation</h1>
        <p className="text-muted-foreground">
          Analyze model performance with comprehensive metrics and visualizations.
        </p>
      </div>

      {/* Model Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Model Selection
          </CardTitle>
          <CardDescription>
            Choose a model to view detailed performance metrics.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Select value={selectedModelId} onValueChange={setSelectedModelId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a model to analyze" />
                </SelectTrigger>
                <SelectContent>
                  {models.map((model) => (
                    <SelectItem key={model.model_id} value={model.model_id}>
                      {model.algorithm} - {(model.accuracy * 100).toFixed(2)}% 
                      ({new Date(model.created_at).toLocaleDateString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedModel && (
              <Badge variant={selectedModel.accuracy > 0.8 ? "default" : "secondary"}>
                {selectedModel.algorithm}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      {selectedModel && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(selectedModel.accuracy * 100).toFixed(2)}%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Algorithm</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {selectedModel.algorithm.replace('_', ' ')}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AUC Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {auc ? auc.toFixed(3) : 'N/A'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Created</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold">
                {new Date(selectedModel.created_at).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      {metricsApi.loading ? (
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-muted-foreground">Loading model metrics...</div>
          </CardContent>
        </Card>
      ) : metrics ? (
        <Tabs defaultValue="performance" className="space-y-4">
          <TabsList>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="confusion">Confusion Matrix</TabsTrigger>
            <TabsTrigger value="roc">ROC Curve</TabsTrigger>
            <TabsTrigger value="features">Feature Importance</TabsTrigger>
            <TabsTrigger value="comparison">Model Comparison</TabsTrigger>
          </TabsList>

          <TabsContent value="performance">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Classification Report</CardTitle>
                  <CardDescription>
                    Precision, recall, and F1-score for each class.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Class</th>
                          <th className="text-right p-2">Precision</th>
                          <th className="text-right p-2">Recall</th>
                          <th className="text-right p-2">F1-Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(metrics.classification_report).map(([classKey, values]: [string, any]) => {
                          if (typeof values === 'object' && values.precision !== undefined) {
                            return (
                              <tr key={classKey} className="border-b">
                                <td className="p-2 font-medium">Class {classKey}</td>
                                <td className="p-2 text-right">{values.precision.toFixed(3)}</td>
                                <td className="p-2 text-right">{values.recall.toFixed(3)}</td>
                                <td className="p-2 text-right">{values['f1-score'].toFixed(3)}</td>
                              </tr>
                            );
                          }
                          return null;
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Overall Metrics</CardTitle>
                  <CardDescription>
                    Summary statistics for model performance.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-3">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Accuracy:</dt>
                      <dd className="font-semibold">{metrics.accuracy.toFixed(4)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">AUC Score:</dt>
                      <dd className="font-semibold">{auc?.toFixed(4) || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Classes:</dt>
                      <dd className="font-semibold">{metrics.confusion_matrix.length}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Features:</dt>
                      <dd className="font-semibold">{metrics.feature_importance.length}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="confusion">
            <Card>
              <CardHeader>
                <CardTitle>Confusion Matrix</CardTitle>
                <CardDescription>
                  Detailed breakdown of predictions vs actual values.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ConfusionMatrix matrix={metrics.confusion_matrix} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roc">
            <Card>
              <CardHeader>
                <CardTitle>ROC Curve</CardTitle>
                <CardDescription>
                  Receiver Operating Characteristic curve showing model performance.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ROCChart fpr={metrics.fpr} tpr={metrics.tpr} auc={auc} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features">
            <Card>
              <CardHeader>
                <CardTitle>Feature Importance</CardTitle>
                <CardDescription>
                  Features ranked by their importance in the model.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FeatureImportance features={metrics.feature_importance} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison">
            <Card>
              <CardHeader>
                <CardTitle>Model Comparison</CardTitle>
                <CardDescription>
                  Compare accuracy across your trained models.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AccuracyChart data={comparisonData} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="text-center p-8">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">No model selected</p>
            <p className="text-muted-foreground">
              Select a model from the dropdown above to view its performance metrics.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}