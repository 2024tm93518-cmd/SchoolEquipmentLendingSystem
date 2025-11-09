# School Equipment Lending - React + C# (.NET 8) + MySQL scaffold

This archive contains:
- backend/SchoolEquipmentLending.Api : C# .NET 8 Web API using EF Core + Pomelo MySQL
- frontend : React app (minimal)

## Backend quick run (summary)
1. Edit backend/SchoolEquipmentLending.Api/appsettings.json and set MySQL connection and Jwt key.
2. From backend/SchoolEquipmentLending.Api run:
   - `dotnet restore`
   - `dotnet tool install --global dotnet-ef` (if needed)
   - `dotnet ef migrations add InitialCreate`
   - `dotnet ef database update`
   - `dotnet run`
3. Use Postman to hit /api/auth/signup then /api/auth/login to get a bearer token.

## Frontend quick run
1. From frontend: `npm install`
2. `npm start`

## Notes
- This is a scaffold and includes core controllers, models, and a simple auth service.
- You may expand validation, error handling, and tests as needed for your assignment.
