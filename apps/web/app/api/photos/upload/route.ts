import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function POST(request: NextRequest) {
  try {
    const { getToken } = await auth();
    const token = await getToken();

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get the form data from the request
    const formData = await request.formData();

    // Log formData entries for debugging
    console.log("FormData entries:");
    for (const [key, value] of formData.entries()) {
      console.log(
        `${key}: ${value instanceof File ? `File: ${value.name}` : value}`
      );
    }

    // Ensure the file field is named correctly
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No file provided or invalid file" },
        { status: 400 }
      );
    }

    // Create a new FormData to ensure correct field names
    const apiFormData = new FormData();
    apiFormData.append("file", file);

    // Add all other form fields
    for (const [key, value] of formData.entries()) {
      if (key !== "file") {
        apiFormData.append(key, value);
      }
    }

    const response = await fetch(`${API_BASE_URL}/photos/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: apiFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: "Failed to upload photo", details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error uploading photo:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
