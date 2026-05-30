using Identity.Core.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Identity.Infrastructure.Data;

public static class IdentityDbSeed
{
    public const string DemoEmail = "demo@retailmesh.com";
    public const string DemoPassword = "Demo@12345";
    public const string AdminEmail = "admin@retailmesh.com";
    public const string AdminPassword = "Admin@12345";

    public static async Task SeedAsync(IServiceProvider services)
    {
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
        var logger = services.GetRequiredService<ILogger<IdentityDbContext>>();

        await EnsureRoleAsync(roleManager, "customer");
        await EnsureRoleAsync(roleManager, "admin");

        await EnsureUserAsync(userManager, DemoEmail, DemoPassword, "Demo", "User", "customer", logger);
        await EnsureUserAsync(userManager, AdminEmail, AdminPassword, "Admin", "User", "admin", logger);
    }

    private static async Task EnsureRoleAsync(RoleManager<IdentityRole> roleManager, string roleName)
    {
        if (!await roleManager.RoleExistsAsync(roleName))
        {
            await roleManager.CreateAsync(new IdentityRole(roleName));
        }
    }

    private static async Task EnsureUserAsync(
        UserManager<ApplicationUser> userManager,
        string email,
        string password,
        string firstName,
        string lastName,
        string role,
        ILogger logger)
    {
        var existing = await userManager.FindByEmailAsync(email);
        if (existing != null)
        {
            if (!await userManager.IsInRoleAsync(existing, role))
            {
                await userManager.AddToRoleAsync(existing, role);
            }

            return;
        }

        var user = new ApplicationUser
        {
            UserName = email,
            Email = email,
            EmailConfirmed = true,
            FirstName = firstName,
            LastName = lastName,
        };

        var result = await userManager.CreateAsync(user, password);
        if (!result.Succeeded)
        {
            logger.LogWarning(
                "Failed to seed user {Email}: {Errors}",
                email,
                string.Join(", ", result.Errors.Select(e => e.Description)));
            return;
        }

        await userManager.AddToRoleAsync(user, role);
        logger.LogInformation("Seeded identity user {Email} with role {Role}", email, role);
    }
}
