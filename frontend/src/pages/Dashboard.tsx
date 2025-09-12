import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Brain, Target, Database } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApi } from "@/hooks/useApi";
import { apiService, Dataset, Model } from "@/services/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [stats, setStats] = useState({
    totalDatasets: 0,
    totalModels: 0,
    bestAccuracy: 0,
    activeDataset: null as Dataset | null,
    activeModel: null as Model | null,
  });

  const datasetsApi = useApi<Dataset[]>();
  const modelsApi = useApi<Model[]>();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [datasetsData, modelsData] = await Promise.all([
        datasetsApi.execute(() => apiService.getDatasets()),
        modelsApi.execute(() => apiService.getModels()),
      ]);

      if (datasetsData) setDatasets(datasetsData);
      if (modelsData) setModels(modelsData);

      // Calculate stats
      const bestAccuracy = modelsData ? Math.max(...modelsData.map(m => m.accuracy), 0) : 0;
      const activeDataset = datasetsData?.[0] || null;
      const activeModel = modelsData?.[0] || null;

      setStats({
        totalDatasets: datasetsData?.length || 0,
        totalModels: modelsData?.length || 0,
        bestAccuracy,
        activeDataset,
        activeModel,
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const quickActions = [
    {
      title: "Upload Dataset",
      description: "Add a new dataset for training",
      icon: Upload,
      action: () => navigate("/datasets"),
      variant: "default" as const,
    },
    {
      title: "Train Model",
      description: "Start training a new model",
      icon: Brain,
      action: () => navigate("/training"),
      variant: "secondary" as const,
    },
    {
      title: "Make Prediction",
      description: "Run predictions with trained models",
      icon: Target,
      action: () => navigate("/prediction"),
      variant: "outline" as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to ML Studio. Monitor your machine learning workflows and manage your models.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Datasets</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDatasets}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeDataset ? `Active: ${stats.activeDataset.name}` : 'No active dataset'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trained Models</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalModels}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeModel ? `Latest: ${stats.activeModel.algorithm}` : 'No models trained'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.bestAccuracy > 0 ? `${(stats.bestAccuracy * 100).toFixed(1)}%` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.bestAccuracy > 0 ? 'Across all models' : 'Train your first model'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <div className="h-4 w-4 bg-success rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Ready</div>
            <p className="text-xs text-muted-foreground">System operational</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Get started with common machine learning tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {quickActions.map((action, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <action.icon className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">{action.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-3">{action.description}</p>
                  <Button variant={action.variant} size="sm" onClick={action.action} className="w-full">
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Datasets</CardTitle>
            <CardDescription>Your latest uploaded datasets</CardDescription>
          </CardHeader>
          <CardContent>
            {datasets.length > 0 ? (
              <div className="space-y-3">
                {datasets.slice(0, 3).map((dataset) => (
                  <div key={dataset.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{dataset.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {dataset.rows} rows, {dataset.columns} columns
                      </p>
                    </div>
                    <Badge variant="secondary">{dataset.target_column || 'No target'}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No datasets uploaded yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Models</CardTitle>
            <CardDescription>Your latest trained models</CardDescription>
          </CardHeader>
          <CardContent>
            {models.length > 0 ? (
              <div className="space-y-3">
                {models.slice(0, 3).map((model) => (
                  <div key={model.model_id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{model.algorithm}</p>
                      <p className="text-sm text-muted-foreground">
                        Accuracy: {(model.accuracy * 100).toFixed(1)}%
                      </p>
                    </div>
                    <Badge variant={model.accuracy > 0.8 ? "default" : "secondary"}>
                      {model.accuracy > 0.8 ? "High" : "Medium"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No models trained yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}