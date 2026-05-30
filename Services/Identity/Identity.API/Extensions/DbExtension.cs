using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Polly;

namespace Identity.API.Extensions;

public static class DbExtension
{
    public static IHost MigrateDatabase<TContext>(this IHost host, Action<TContext, IServiceProvider> seeder)
        where TContext : DbContext
    {
        using var scope = host.Services.CreateScope();
        var services = scope.ServiceProvider;
        var logger = services.GetRequiredService<ILogger<TContext>>();
        var context = services.GetService<TContext>();

        try
        {
            logger.LogInformation("Started Db Migration: {Context}", typeof(TContext).Name);
            var retry = Policy.Handle<SqlException>()
                .WaitAndRetry(
                    5,
                    retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)),
                    (exception, _, _) => logger.LogError(exception, "Retrying database migration"));

            retry.Execute(() => CallSeeder(seeder, context, services));
            logger.LogInformation("Migration Completed: {Context}", typeof(TContext).Name);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while migrating db: {Context}", typeof(TContext).Name);
        }

        return host;
    }

    private static void CallSeeder<TContext>(
        Action<TContext, IServiceProvider> seeder,
        TContext? context,
        IServiceProvider services)
        where TContext : DbContext
    {
        if (context == null)
        {
            return;
        }

        context.Database.Migrate();
        seeder(context, services);
    }
}
