# SchoolEquipmentLending.Api (C# .NET 8)

## Quick start (backend)

1. Install .NET 8 SDK.
2. Update `appsettings.json` connection string with your MySQL credentials.
3. From the `backend/SchoolEquipmentLending.Api` folder run:
   - `dotnet restore`
   - `dotnet ef migrations add InitialCreate` (you may need to install dotnet-ef tool)
   - `dotnet ef database update`
   - `dotnet run`
4. API will run (by default) at `https://localhost:7123` (Kestrel default ports) — see console for exact URL.

Notes:
- Uses Pomelo MySQL provider and EF Core.
- JWT auth is configured via appsettings.json -> Jwt.
