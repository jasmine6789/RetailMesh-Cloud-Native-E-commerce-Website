using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Ordering.Core.Entities;

namespace Ordering.Infrastructure.Data;

public class OrderContextSeed
{
    public static async Task SeedAsync(OrderContext orderContext, ILogger<OrderContextSeed> logger)
    {
        // Ensure Activities table exists (migration might not have been applied)
        await EnsureActivitiesTableExistsAsync(orderContext, logger);
        await EnsureOrderCorrelationIdColumnExistsAsync(orderContext, logger);
        await EnsureOrderItemsTableExistsAsync(orderContext, logger);

        if (!orderContext.Orders.Any())
        {
            orderContext.Orders.AddRange(GetOrders());
            await orderContext.SaveChangesAsync();
            logger.LogInformation($"Ordering Database: {typeof(OrderContext).Name} seeded!!!");
        }
    }

    private static async Task EnsureActivitiesTableExistsAsync(OrderContext orderContext, ILogger<OrderContextSeed> logger)
    {
        try
        {
            // Check if Activities table exists and create if not
            await orderContext.Database.ExecuteSqlRawAsync(@"
                IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Activities]') AND type in (N'U'))
                BEGIN
                    CREATE TABLE [dbo].[Activities] (
                        [Id] int IDENTITY(1,1) NOT NULL,
                        [EventId] uniqueidentifier NOT NULL,
                        [ActivityType] nvarchar(50) NOT NULL,
                        [EntityType] nvarchar(50) NOT NULL,
                        [EntityId] nvarchar(100) NOT NULL,
                        [Title] nvarchar(200) NOT NULL,
                        [Description] nvarchar(500) NULL,
                        [Actor] nvarchar(100) NULL,
                        [SourceService] nvarchar(50) NOT NULL,
                        [Metadata] nvarchar(max) NULL,
                        [OccurredAt] datetime2 NOT NULL,
                        [CreatedBy] nvarchar(max) NULL,
                        [CreatedDate] datetime2 NULL,
                        [LastModifiedBy] nvarchar(max) NULL,
                        [LastModifiedDate] datetime2 NULL,
                        CONSTRAINT [PK_Activities] PRIMARY KEY ([Id]),
                        CONSTRAINT [UX_Activities_EventId] UNIQUE ([EventId])
                    );

                    CREATE INDEX [IX_Activities_CreatedDate] ON [dbo].[Activities] ([CreatedDate]);
                    CREATE INDEX [IX_Activities_OccurredAt] ON [dbo].[Activities] ([OccurredAt]);
                    CREATE INDEX [IX_Activities_ActivityType] ON [dbo].[Activities] ([ActivityType]);
                    CREATE INDEX [IX_Activities_EntityType] ON [dbo].[Activities] ([EntityType]);
                END
            ");

            logger.LogInformation("Activities table ensured");
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Failed to ensure Activities table exists, it might already exist");
        }
    }

    private static async Task EnsureOrderCorrelationIdColumnExistsAsync(
        OrderContext orderContext,
        ILogger<OrderContextSeed> logger)
    {
        try
        {
            await orderContext.Database.ExecuteSqlRawAsync(@"
                IF COL_LENGTH('dbo.Orders', 'CorrelationId') IS NULL
                BEGIN
                    ALTER TABLE [dbo].[Orders] ADD [CorrelationId] nvarchar(450) NULL;
                END

                IF NOT EXISTS (
                    SELECT 1
                    FROM sys.indexes
                    WHERE name = N'IX_Orders_CorrelationId'
                      AND object_id = OBJECT_ID(N'[dbo].[Orders]'))
                BEGIN
                    CREATE UNIQUE INDEX [IX_Orders_CorrelationId]
                    ON [dbo].[Orders] ([CorrelationId])
                    WHERE [CorrelationId] IS NOT NULL;
                END
            ");

            logger.LogInformation("Orders.CorrelationId column ensured");
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Failed to ensure Orders.CorrelationId column exists");
        }
    }

    private static async Task EnsureOrderItemsTableExistsAsync(
        OrderContext orderContext,
        ILogger<OrderContextSeed> logger)
    {
        try
        {
            await orderContext.Database.ExecuteSqlRawAsync(@"
                IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[OrderItems]') AND type in (N'U'))
                BEGIN
                    CREATE TABLE [dbo].[OrderItems] (
                        [Id] int IDENTITY(1,1) NOT NULL,
                        [OrderId] int NOT NULL,
                        [ProductId] nvarchar(max) NULL,
                        [ProductName] nvarchar(max) NULL,
                        [Price] decimal(18,2) NULL,
                        [Quantity] int NULL,
                        [ImageFile] nvarchar(max) NULL,
                        [CreatedBy] nvarchar(max) NULL,
                        [CreatedDate] datetime2 NULL,
                        [LastModifiedBy] nvarchar(max) NULL,
                        [LastModifiedDate] datetime2 NULL,
                        CONSTRAINT [PK_OrderItems] PRIMARY KEY ([Id]),
                        CONSTRAINT [FK_OrderItems_Orders_OrderId] FOREIGN KEY ([OrderId])
                            REFERENCES [dbo].[Orders] ([Id]) ON DELETE CASCADE
                    );

                    CREATE INDEX [IX_OrderItems_OrderId] ON [dbo].[OrderItems] ([OrderId]);
                END
            ");

            logger.LogInformation("OrderItems table ensured");
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Failed to ensure OrderItems table exists");
        }
    }

    private static IEnumerable<Order> GetOrders()
    {
        return new List<Order>
        {
            new()
            {
                UserName = "demo@retailmesh.com",
                FirstName = "Demo",
                LastName = "Customer",
                EmailAddress = "demo@retailmesh.com",
                AddressLine = "123 Main Street",
                Country = "United States",
                TotalPrice = 750,
                State = "CA",
                ZipCode = "90210",

                CardName = "Visa",
                CardNumber = "1234567890",
                CreatedBy = "demo@retailmesh.com",
                Expiration = "12/25",
                Cvv = "123",
                PaymentMethod = 1,
                LastModifiedBy = "demo@retailmesh.com",
                LastModifiedDate = new DateTime()
            }
        };
    }
}