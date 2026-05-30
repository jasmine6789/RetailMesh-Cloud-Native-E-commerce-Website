using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace Common.Auth;

public static class CurrentUser
{
    public static string? GetEmail(ClaimsPrincipal? user)
    {
        if (user?.Identity?.IsAuthenticated != true)
        {
            return null;
        }

        return user.FindFirstValue(ClaimTypes.Email)
            ?? user.FindFirstValue("email");
    }

    public static bool MatchesUserName(ClaimsPrincipal? user, string? userName)
    {
        if (string.IsNullOrWhiteSpace(userName))
        {
            return false;
        }

        var email = GetEmail(user);
        return !string.IsNullOrWhiteSpace(email)
            && string.Equals(email, userName, StringComparison.OrdinalIgnoreCase);
    }

    public static ActionResult? ForbidIfUserNameMismatch(ControllerBase controller, string? userName)
    {
        return MatchesUserName(controller.User, userName)
            ? null
            : controller.Forbid();
    }
}
