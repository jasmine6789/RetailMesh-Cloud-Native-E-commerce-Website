using Identity.Core.Entities;

namespace Identity.Infrastructure.Services;

public interface IJwtTokenService
{
    (string AccessToken, int ExpiresInSeconds) CreateAccessToken(ApplicationUser user, IList<string> roles);
}
