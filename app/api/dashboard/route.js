export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const adminEmail = process.env.DASHBOARD_EMAIL;
    const adminPassword = process.env.DASHBOARD_PASSWORD;

    if (email === adminEmail && password === adminPassword) {
      return Response.json(
        { success: true, message: "Login successful" },
        { status: 200 },
      );
    }

    return Response.json(
      { success: false, message: "Invalid credentials" },
      { status: 401 },
    );
  } catch (error) {
    return Response.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
