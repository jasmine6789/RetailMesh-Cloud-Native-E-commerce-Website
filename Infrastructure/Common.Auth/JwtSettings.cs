namespace Common.Auth;

public class JwtSettings
{
    public const string SectionName = "Jwt";

    public string Secret { get; set; } = string.Empty;
    public string Issuer { get; set; } = "https://localhost:8010";
    public string Audience { get; set; } = "ecommerce-api";
    public int ExpiryMinutes { get; set; } = 60;
}
