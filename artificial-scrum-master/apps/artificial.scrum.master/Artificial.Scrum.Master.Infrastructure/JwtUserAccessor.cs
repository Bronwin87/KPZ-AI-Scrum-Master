using Artificial.Scrum.Master.Interfaces;
using Microsoft.AspNetCore.Http;

namespace Artificial.Scrum.Master.Infrastructure
{
    internal class JwtUserAccessor(IHttpContextAccessor _httpContextAccessor) : IUserAccessor
    {
        public string? UserId
        {
            get
            {
                var claims = _httpContextAccessor.HttpContext?.User.Claims;
                var claim = claims?.FirstOrDefault(x => x.Type == "UserId");

                return claim?.Value;
            }
        }

        public string? UserName
        {
            get
            {
                var claims = _httpContextAccessor.HttpContext?.User.Claims;
                var claim = claims?.FirstOrDefault(x => x.Type == "UserName");

                return claim?.Value;
            }
        }

        public string? PhotoUrl
        {
            get
            {
                var claims = _httpContextAccessor.HttpContext?.User.Claims;
                var claim = claims?.FirstOrDefault(x => x.Type == "PhotoUrl");

                return claim?.Value;
            }
        }
    }
}
