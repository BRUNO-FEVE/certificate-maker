/* eslint-disable react/jsx-no-undef */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";
import "./globals.css";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  AlertCircle,
  Upload,
  FileJson,
  Mail,
  Download,
  RefreshCw,
  Info,
  // ChevronLeft,
  // ChevronRight,
} from "lucide-react";
import Certificate from "@/components/certificate";

import { Member } from "./list";

export default function Home() {
  const [currentStep, setCurrentStep] = useState("template");
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [templatePreview, setTemplatePreview] = useState<string | null>(null);
  const [jsonData, setJsonData] = useState("");
  const [emailSubject, setEmailSubject] = useState(
    "Your Certificate of Completion, {name}"
  );
  const [emailBody, setEmailBody] = useState(
    "Dear {name},\n\nCongratulations on completing {hoursWorked} hours as a {role}.\n\nBest regards,\nYour Company"
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [generationComplete, setGenerationComplete] = useState(false);
  const [emailStatus, setEmailStatus] = useState<
    Array<{ email: string; status: "success" | "failed" | "pending" }>
  >([]);
  const [progress, setProgress] = useState<number>(0);
  // const [currentMemberExempleIndex, SetCurrentMemberExempleIndex] =
  // useState<number>(0);

  const handleTemplateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setTemplateFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setTemplatePreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setJsonData(e.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleJsonInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonData(e.target.value);
  };

  const generateCertificates = async () => {
    setIsGenerating(true);

    // Validate JSON data before proceeding
    let recipientData: Member[] = [];
    try {
      if (!jsonData.trim()) throw new Error("No JSON data provided");
      const data = JSON.parse(jsonData);
      if (!Array.isArray(data)) throw new Error("Data must be an array");
      recipientData = data;
    } catch (error: any) {
      console.error("Invalid JSON data", error);
      alert(error.message);
      setIsGenerating(false);
      return;
    }

    try {
      const members = recipientData;

      console.log(members);

      let index = 0;
      for (const member of members) {
        const res = await fetch("/api/generate-one-certificate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ index: index, member: member }),
        });

        if (!res.ok) throw new Error(await res.text());

        const totalPercentage = members.length;
        const percentComplete = Math.round(
          ((index + 1) / totalPercentage) * 100
        );
        setProgress(percentComplete);

        index++;
      }

      setIsGenerating(false);
      setGenerationComplete(true);
    } catch (err: any) {
      console.log(err);
    }
  };

  const generateZip = async () => {
    try {
      // Hit the download endpoint
      const res = await fetch("/api/download-certificates");

      if (!res.ok) {
        throw new Error("Failed to fetch ZIP");
      }

      // Read it as a blob
      const blob = await res.blob();
      // Create a temporary download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "certificates.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error(err);
      alert("Error downloading ZIP: " + err.message);
    }
  };

  const sendEmails = () => {
    // const API_KEY = "re_h55ixYwL_qiGjG411AUUgVrC8XoSRophr";
  };

  const retryFailedEmails = () => {
    const updatedStatus = [...emailStatus];
    updatedStatus.forEach((item, index) => {
      if (item.status === "failed") {
        updatedStatus[index].status = "pending";
      }
    });
    setEmailStatus(updatedStatus);

    // Simulate retrying
    setIsSending(true);
    const retryWithDelay = (index: number) => {
      if (index >= updatedStatus.length) {
        setIsSending(false);
        return;
      }

      if (updatedStatus[index].status === "pending") {
        setTimeout(() => {
          updatedStatus[index].status = "success";
          setEmailStatus([...updatedStatus]);
          retryWithDelay(index + 1);
        }, 500);
      } else {
        retryWithDelay(index + 1);
      }
    };

    retryWithDelay(0);
  };

  const getRecipientCount = () => {
    if (!jsonData.trim()) {
      return 0;
    }

    try {
      const data = JSON.parse(jsonData);
      return Array.isArray(data) ? data.length : 0;
    } catch (error) {
      console.error("Invalid JSON data in recipient count", error);
      return 0;
    }
  };

  const getSuccessCount = () => {
    return emailStatus.filter((item) => item.status === "success").length;
  };

  const getFailedCount = () => {
    return emailStatus.filter((item) => item.status === "failed").length;
  };

  const getPendingCount = () => {
    return emailStatus.filter((item) => item.status === "pending").length;
  };

  const previewCertificate = () => {
    if (!jsonData.trim()) {
      return null;
    }

    try {
      const data = JSON.parse(jsonData);
      if (Array.isArray(data) && data.length > 0) {
        return data[0];
      }
    } catch (error) {
      console.error("Invalid JSON data in preview", error);
    }
    return null;
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">
        Certificate Generator Platform
      </h1>

      <Tabs
        value={currentStep}
        onValueChange={setCurrentStep}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="template">1. Template</TabsTrigger>
          <TabsTrigger value="data">2. Recipient Data</TabsTrigger>
          <TabsTrigger value="email">3. Email Setup</TabsTrigger>
          <TabsTrigger value="generate">4. Generate & Send</TabsTrigger>
        </TabsList>

        <TabsContent value="template" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Certificate Template</CardTitle>
              <CardDescription>
                Upload a PNG file that will serve as the base design for your
                certificates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="template-upload">Upload Template (PNG)</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="template-upload"
                      type="file"
                      accept=".png"
                      onChange={handleTemplateUpload}
                    />
                    <Button
                      variant="outline"
                      onClick={() =>
                        document.getElementById("template-upload")?.click()
                      }
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Browse
                    </Button>
                  </div>
                </div>

                {templatePreview && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium mb-2">Preview:</h3>
                    <div className="border rounded-md p-2 bg-muted/20">
                      <img
                        src={templatePreview || "/placeholder.svg"}
                        alt="Certificate Template"
                        className="max-w-full max-h-[300px] object-contain mx-auto"
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button
                    onClick={() => setCurrentStep("data")}
                    disabled={!templateFile}
                  >
                    Next: Recipient Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recipient Data</CardTitle>
              <CardDescription>
                Provide a JSON array of recipient information for certificate
                generation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="json-upload">
                    Upload JSON File (Optional)
                  </Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="json-upload"
                      type="file"
                      accept=".json"
                      onChange={handleJsonUpload}
                    />
                    <Button
                      variant="outline"
                      onClick={() =>
                        document.getElementById("json-upload")?.click()
                      }
                    >
                      <FileJson className="mr-2 h-4 w-4" />
                      Browse
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="json-input">JSON Data</Label>
                  <Textarea
                    id="json-input"
                    placeholder='[{"name": "John Doe", "email": "john@example.com", "role": "Developer", "hoursWorked": 120}]'
                    value={jsonData}
                    onChange={handleJsonInput}
                    className="min-h-[200px] font-mono text-sm"
                  />
                  {jsonData.trim() && (
                    <div className="text-sm mt-1">
                      {(() => {
                        try {
                          const data = JSON.parse(jsonData);
                          if (!Array.isArray(data)) {
                            return (
                              <p className="text-red-500">
                                Error: Data must be an array
                              </p>
                            );
                          }
                          return (
                            <p className="text-green-600">
                              ✓ Valid JSON with {data.length} recipient(s)
                            </p>
                          );
                        } catch (error: any) {
                          console.error("Invalid JSON data in preview", error);
                          return (
                            <p className="text-red-500">
                              Error: Invalid JSON format
                            </p>
                          );
                        }
                      })()}
                    </div>
                  )}
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Expected JSON Format</AlertTitle>
                  <AlertDescription className="flex flex-row gap-2 items-center">
                    <>Each object should include:</>
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">
                      name
                    </code>
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">
                      email
                    </code>
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">
                      role
                    </code>
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">
                      hoursWorked
                    </code>
                  </AlertDescription>
                </Alert>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep("template")}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setCurrentStep("email")}
                    disabled={!jsonData}
                  >
                    Next: Email Setup
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>
                Customize the email that will be sent with each certificate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email-subject">Email Subject</Label>
                  <Input
                    id="email-subject"
                    placeholder="Your Certificate of Completion, {name}"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Use{" "}
                    <code className="bg-muted px-1 py-0.5 rounded">
                      {"{name}"}
                    </code>
                    ,{" "}
                    <code className="bg-muted px-1 py-0.5 rounded">
                      {"{role}"}
                    </code>
                    , or{" "}
                    <code className="bg-muted px-1 py-0.5 rounded">
                      {"{hoursWorked}"}
                    </code>{" "}
                    as placeholders
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="email-body">Email Body</Label>
                  <Textarea
                    id="email-body"
                    placeholder="Dear {name},&#10;&#10;Congratulations on completing {hoursWorked} hours as a {role}.&#10;&#10;Best regards,&#10;Your Company"
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    className="min-h-[200px]"
                  />
                </div>

                <div className="bg-muted/30 p-4 rounded-md">
                  <h3 className="text-sm font-medium mb-2">
                    Preview with sample data:
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium">Subject: </span>
                      <span className="text-sm">
                        {emailSubject
                          .replace("{name}", "John Doe")
                          .replace("{role}", "Developer")
                          .replace("{hoursWorked}", "120")}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Body: </span>
                      <div className="text-sm whitespace-pre-line bg-white p-2 rounded border mt-1">
                        {emailBody
                          .replace(/{name}/g, "John Doe")
                          .replace(/{role}/g, "Developer")
                          .replace(/{hoursWorked}/g, "120")}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep("data")}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setCurrentStep("generate")}
                    disabled={!emailSubject || !emailBody}
                  >
                    Next: Generate & Send
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generate" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate Certificates & Send Emails</CardTitle>
              <CardDescription>
                Generate PDF certificates and send them to recipients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="bg-muted/30 p-4 rounded-md">
                  <h3 className="text-sm font-medium mb-2">Summary:</h3>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <span className="font-medium">Template:</span>{" "}
                      {templateFile?.name || "Not uploaded"}
                    </li>
                    <li>
                      <span className="font-medium">Recipients:</span>{" "}
                      {getRecipientCount()}
                    </li>
                    <li>
                      <span className="font-medium">Email Subject:</span>{" "}
                      {emailSubject}
                    </li>
                  </ul>
                </div>

                {previewCertificate() && templatePreview && (
                  <div className="border rounded-md p-4">
                    <h3 className="text-sm font-medium mb-2">
                      Certificate Preview (Sample):
                    </h3>
                    <Certificate
                      name={JSON.parse(jsonData)[0].name}
                      role={JSON.parse(jsonData)[0].role}
                      hour={JSON.parse(jsonData)[0].hoursWorked}
                    />
                    {/*
                    <div className="w-full flex flex-row items-center justify-center py-4 gap-2">
                      <ChevronLeft
                        className="cursor-pointer"
                        onClick={() => {
                          SetCurrentMemberExempleIndex((prev) => prev + 1);
                        }}
                      />
                      <p>
                        {currentMemberExempleIndex}/
                        {JSON.parse(jsonData).length}
                      </p>
                      <ChevronRight
                        onClick={() => {
                          SetCurrentMemberExempleIndex((prev) => prev - 1);
                        }}
                      />
                    </div>
                     */}
                    <p className="text-xs text-muted-foreground mt-2">
                      Note: This is a simplified preview. Actual PDFs will have
                      proper text positioning.
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <Button
                      onClick={generateCertificates}
                      disabled={
                        isGenerating ||
                        !templateFile ||
                        !jsonData ||
                        generationComplete
                      }
                      className="w-full"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Generating Certificates...
                        </>
                      ) : generationComplete ? (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Certificates Generated
                        </>
                      ) : (
                        "Generate Certificates"
                      )}
                    </Button>

                    {isGenerating && (
                      <Progress value={progress} className="mt-2" />
                    )}

                    {generationComplete && (
                      <div className="mt-4 flex justify-center">
                        <Button variant="outline" onClick={generateZip}>
                          <Download className="mr-2 h-4 w-4" />
                          Download ZIP Archive
                        </Button>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div>
                    <Button
                      onClick={sendEmails}
                      disabled={
                        isSending ||
                        !generationComplete ||
                        emailStatus.length === 0
                      }
                      className="w-full"
                      variant="secondary"
                    >
                      {isSending ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Sending Emails...
                        </>
                      ) : (
                        <>
                          <Mail className="mr-2 h-4 w-4" />
                          Send Emails to Recipients
                        </>
                      )}
                    </Button>
                  </div>

                  {emailStatus.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium mb-2">
                        Email Status:
                      </h3>
                      <div className="flex gap-2 mb-4">
                        <Badge variant="outline" className="bg-green-50">
                          <CheckCircle className="mr-1 h-3 w-3" />{" "}
                          {getSuccessCount()} Sent
                        </Badge>
                        <Badge variant="outline" className="bg-red-50">
                          <AlertCircle className="mr-1 h-3 w-3" />{" "}
                          {getFailedCount()} Failed
                        </Badge>
                        <Badge variant="outline" className="bg-yellow-50">
                          <RefreshCw className="mr-1 h-3 w-3" />{" "}
                          {getPendingCount()} Pending
                        </Badge>
                      </div>

                      <div className="max-h-[200px] overflow-y-auto border rounded-md">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Email
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {emailStatus.map((item, index) => (
                              <tr key={index}>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">
                                  {item.email}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap">
                                  {item.status === "success" && (
                                    <Badge
                                      variant="outline"
                                      className="bg-green-50"
                                    >
                                      <CheckCircle className="mr-1 h-3 w-3" />{" "}
                                      Sent
                                    </Badge>
                                  )}
                                  {item.status === "failed" && (
                                    <Badge
                                      variant="outline"
                                      className="bg-red-50"
                                    >
                                      <AlertCircle className="mr-1 h-3 w-3" />{" "}
                                      Failed
                                    </Badge>
                                  )}
                                  {item.status === "pending" && (
                                    <Badge
                                      variant="outline"
                                      className="bg-yellow-50"
                                    >
                                      <RefreshCw className="mr-1 h-3 w-3 animate-spin" />{" "}
                                      Pending
                                    </Badge>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {getFailedCount() > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={retryFailedEmails}
                          disabled={isSending}
                        >
                          <RefreshCw className="mr-1 h-3 w-3" />
                          Retry Failed Emails
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep("email")}
                  >
                    Back
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setTemplateFile(null);
                      setTemplatePreview(null);
                      setJsonData("");
                      setEmailSubject("Your Certificate of Completion, {name}");
                      setEmailBody(
                        "Dear {name},\n\nCongratulations on completing {hoursWorked} hours as a {role}.\n\nBest regards,\nYour Company"
                      );
                      setIsGenerating(false);
                      setIsSending(false);
                      setGenerationComplete(false);
                      setEmailStatus([]);
                      setCurrentStep("template");
                    }}
                  >
                    Start New Batch
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
