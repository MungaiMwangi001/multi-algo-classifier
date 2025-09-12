import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Brain, Eye, Download, Trash2, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApi } from "@/hooks/useApi";
import { apiService, Model } from "@/services/api";

export default function Models() {
  const navigate = useNavigate();
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);

  const modelsApi = useApi<Model[]>();
  const deleteApi = useApi<void>();

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    await modelsApi.execute(() => apiService.getModels(), {
      onSuccess: (data) => {
        setModels(data);
        if (data.length > 0 && !selectedModel) {
          setSelectedModel(data[0]);
        }
      },
    });
  };

  const handleViewResults = (model: Model) => {
    navigate(`/results?model=${model.model_id}`);
  };

  const handleDownloadModel = (model: Model) => {
    // In a real app, this would download the model file
    console.log('Download model:', model.model_id);
  };

  const handleDeleteModel = async (model: Model) => {
    await deleteApi.execute(
      () => apiService.deleteModel(model.model_id),
      {
        onSuccess: () => {
          setModels(prev => prev.filter(m => m.model_id !== model.model_id));
          if (selectedModel?.model_id === model.model_id) {
            setSelectedModel(models.find(m => m.model_id !== model.model_id) || null);
          }
        },
        showSuccessToast: true,
        successMessage: `Model deleted successfully!`,
      }
    );
  };

  const getAccuracyBadge = (accuracy: number) => {
    if (accuracy >= 0.9) return { variant: "default" as const, label: "Excellent" };
    if (accuracy >= 0.8) return { variant: "secondary" as const, label: "Good" };
    if (accuracy >= 0.7) return { variant: "outline" as const, label: "Fair" };
    return { variant: "destructive" as const, label: "Poor" };
  };

  const bestModel = models.reduce((best, current) => 
    current.accuracy > (best?.accuracy || 0) ? current : best, 
    null as Model | null
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Models</h1>
        <p className="text-muted-foreground">
          Manage your trained machine learning models and view their performance.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Models</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{models.length}</div>
            <p className="text-xs text-muted-foreground">
              Trained models available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Accuracy</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bestModel ? `${(bestModel.accuracy * 100).toFixed(1)}%` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {bestModel ? bestModel.algorithm : 'No models trained'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Algorithms Used</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(models.map(m => m.algorithm)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Different algorithms trained
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Models Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Trained Models
          </CardTitle>
          <CardDescription>
            All your trained models with performance metrics and actions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {modelsApi.loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-muted-foreground">Loading models...</div>
            </div>
          ) : models.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Algorithm</TableHead>
                    <TableHead>Accuracy</TableHead>
                    <TableHead>Quality</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Parameters</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {models.map((model) => {
                    const accuracyInfo = getAccuracyBadge(model.accuracy);
                    return (
                      <TableRow key={model.model_id}>
                        <TableCell className="font-medium">
                          {model.algorithm.replace('_', ' ')}
                          {model === bestModel && (
                            <Badge variant="outline" className="ml-2">Best</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="font-mono">
                            {(model.accuracy * 100).toFixed(2)}%
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={accuracyInfo.variant}>
                            {accuracyInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(model.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {Object.entries(model.params)
                              .slice(0, 2)
                              .map(([key, value]) => `${key}: ${value}`)
                              .join(', ')}
                            {Object.keys(model.params).length > 2 && '...'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewResults(model)}
                              title="View Results"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadModel(model)}
                              title="Download Model"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteModel(model)}
                              title="Delete Model"
                              disabled={deleteApi.loading}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center p-8">
              <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">No models trained</p>
              <p className="text-muted-foreground mb-4">
                Train your first model to see it listed here.
              </p>
              <Button onClick={() => navigate('/training')}>
                Start Training
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Model Details */}
      {selectedModel && (
        <Card>
          <CardHeader>
            <CardTitle>Model Details</CardTitle>
            <CardDescription>
              Detailed information about the selected model.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-2">Basic Information</h4>
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Model ID:</dt>
                    <dd className="font-mono">{selectedModel.model_id}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Algorithm:</dt>
                    <dd>{selectedModel.algorithm.replace('_', ' ')}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Dataset:</dt>
                    <dd>{selectedModel.dataset_id}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Accuracy:</dt>
                    <dd>{(selectedModel.accuracy * 100).toFixed(2)}%</dd>
                  </div>
                </dl>
              </div>
              <div>
                <h4 className="font-medium mb-2">Hyperparameters</h4>
                <dl className="space-y-1 text-sm">
                  {Object.entries(selectedModel.params).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <dt className="text-muted-foreground">{key}:</dt>
                      <dd className="font-mono">{String(value)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}