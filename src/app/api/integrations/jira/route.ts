import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { domain, email, token, projectKey, tickets } = body;

    if (!domain || !email || !token || !projectKey || !tickets) {
      return NextResponse.json({ error: "Missing required Jira configuration or tickets." }, { status: 400 });
    }

    // Clean domain
    let baseUrl = domain;
    if (!baseUrl.startsWith("http")) {
      baseUrl = `https://${baseUrl}`;
    }

    // Jira uses Basic Auth: base64(email:token)
    const authString = Buffer.from(`${email}:${token}`).toString("base64");

    // Format for Jira Bulk Create
    // Note: To keep things robust without fetching metadata, we map generic types to "Task"
    // and inject priority/assignee into the description so data isn't lost if Jira doesn't 
    // have matching exact users/priorities configured.
    const issueUpdates = tickets.map((t: { title: string, description?: string, type?: string, priority?: string, assignee?: string }) => ({
      fields: {
        project: { key: projectKey.toUpperCase() },
        summary: t.title,
        description: {
          type: "doc",
          version: 1,
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", text: t.description || "No description provided." }
              ]
            },
            {
              type: "paragraph",
              content: [
                { type: "text", text: `\n\n--- \nExtracted by Distill AI\nType: ${t.type}\nPriority: ${t.priority}\nSuggested Assignee: ${t.assignee}` }
              ]
            }
          ]
        },
        issuetype: { name: "Task" } // Hardcoded to Task to ensure it works across instances without metadata fetching
      }
    }));

    const response = await fetch(`${baseUrl}/rest/api/3/issue/bulk`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${authString}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ issueUpdates })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Jira API Error:", data);
      return NextResponse.json(
        { error: "Jira API rejected the request.", details: data },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    console.error("Jira Proxy Error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Internal Server Error syncing to Jira.", message: msg },
      { status: 500 }
    );
  }
}
