import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Eye, Trash2, Database, FileSpreadsheet } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { apiService, Dataset, DatasetUploadResponse } from "@/services/api";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";

export default function Datasets() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [previewData, setPreviewData] = useState<{ headers: string[]; rows: string[][] } | null>(null);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [uploadTargetColumn, setUploadTargetColumn] = useState<string>("");
  const [uploadDatasetName, setUploadDatasetName] = useState<string>("");

  const datasetsApi = useApi<Dataset[]>();
  const uploadApi = useApi<DatasetUploadResponse>();

  useEffect(() => {
    loadDatasets();
  }, []);

  const loadDatasets = async () => {
    await datasetsApi.execute(() => apiService.getDatasets(), {
      onSuccess: (data) => setDatasets(data),
    });
  };

  const handleFileUpload = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      return;
    }

    // Set default dataset name if not provided
    const datasetName = uploadDatasetName || file.name.replace('.csv', '');

    try {
      await uploadApi.execute(
        () => apiService.uploadDataset(file, datasetName, uploadTargetColumn || undefined),
        {
          onSuccess: (response) => {
            // Show preview of uploaded data
            if (response.preview && response.preview.length > 0) {
              setPreviewData({
                headers: response.preview[0],
                rows: response.preview.slice(1, 11), // First 10 rows
              });
            }
            loadDatasets(); // Refresh datasets list
            // Reset form
            setUploadDatasetName("");
            setUploadTargetColumn("");
          },
          showSuccessToast: true,
          successMessage: `Dataset "${datasetName}" uploaded successfully!`,
        }
      );
    } catch (error) {
      console.error('Upload failed:', error);
    }
  }, [uploadApi]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileUpload,
    accept: {
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
  });

  const handlePreviewDataset = async (dataset: Dataset) => {
    setSelectedDataset(dataset);
    // In a real app, you'd fetch preview data from the API
    // For now, we'll just show dataset info
    setPreviewData(null);
  };

  const handleDeleteDataset = async (datasetId: string) => {
    if (window.confirm('Are you sure you want to delete this dataset? This action cannot be undone.')) {
      try {
        await apiService.deleteDataset(datasetId);
        loadDatasets(); // Refresh the list
        // Clear preview if deleted dataset was selected
        if (selectedDataset?.id === datasetId) {
          setSelectedDataset(null);
          setPreviewData(null);
        }
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Datasets</h1>
        <p className="text-muted-foreground">
          Upload and manage your datasets for machine learning training.
        </p>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Dataset
          </CardTitle>
          <CardDescription>
            Drag and drop a CSV file or click to select. The first row should contain column headers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Dataset Name and Target Column */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dataset-name">Dataset Name</Label>
              <Input
                id="dataset-name"
                placeholder="Enter dataset name"
                value={uploadDatasetName}
                onChange={(e) => setUploadDatasetName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target-column">Target Column (Optional)</Label>
              <Input
                id="target-column"
                placeholder="Enter target column name"
                value={uploadTargetColumn}
                onChange={(e) => setUploadTargetColumn(e.target.value)}
              />
            </div>
          </div>
          
          {/* File Upload Area */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
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
                <p className="text-lg font-medium mb-2">Upload your dataset</p>
                <p className="text-muted-foreground">
                  Click here or drag and drop a CSV file to upload
                </p>
              </div>
            )}
          </div>
          
          {uploadApi.loading && (
            <div className="mt-4 p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <p className="text-warning">Uploading dataset...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Section */}
      {previewData && (
        <Card>
          <CardHeader>
            <CardTitle>Dataset Preview</CardTitle>
            <CardDescription>First 10 rows of the uploaded dataset</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {previewData.headers.map((header, index) => (
                      <TableHead key={index}>{header}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.rows.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <TableCell key={cellIndex}>{cell}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Datasets List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Your Datasets
          </CardTitle>
          <CardDescription>
            {datasets.length} dataset{datasets.length !== 1 ? 's' : ''} available
          </CardDescription>
        </CardHeader>
        <CardContent>
          {datasetsApi.loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-muted-foreground">Loading datasets...</div>
            </div>
          ) : datasets.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Rows</TableHead>
                    <TableHead>Columns</TableHead>
                    <TableHead>Target Column</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {datasets.map((dataset) => (
                    <TableRow key={dataset.id}>
                      <TableCell className="font-medium">{dataset.name}</TableCell>
                      <TableCell>{dataset.rows.toLocaleString()}</TableCell>
                      <TableCell>{dataset.columns}</TableCell>
                      <TableCell>
                        {dataset.target_column ? (
                          <Badge variant="secondary">{dataset.target_column}</Badge>
                        ) : (
                          <span className="text-muted-foreground">Not set</span>
                        )}
                      </TableCell>
                      <TableCell>{new Date(dataset.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePreviewDataset(dataset)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteDataset(dataset.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center p-8">
              <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">No datasets uploaded</p>
              <p className="text-muted-foreground">
                Upload your first CSV dataset to get started with machine learning.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}