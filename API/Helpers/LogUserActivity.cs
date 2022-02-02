using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Extensions;
using API.Interfaces;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;

namespace API.Helpers
{
    public class LogUserActivity : IAsyncResultFilter
    {
        public async Task OnResultExecutionAsync(ResultExecutingContext context, ResultExecutionDelegate next)
        {
            var nextContext = await next();

            if(!nextContext.HttpContext.User.Identity.IsAuthenticated) return;

            var userId = nextContext.HttpContext.User.GetUserId();
            var repo = nextContext.HttpContext.RequestServices.GetService<IUserRepository>();
 
            if(repo == null) return;

            var user = await repo.GetUserByIdAsync(userId);
            user.LastActive = DateTime.Now;
            await repo.SaveAllAsync();
        }
    }
}