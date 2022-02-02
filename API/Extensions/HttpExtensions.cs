using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using API.Helpers;
using Microsoft.AspNetCore.Http;

namespace API.Extensions
{
    public static class HttpExtensions
    {
        public static void PaginationHeader(this HttpResponse httpResponse, int currentPage, 
        int itemsPerPage, int totalItems, int totalPages)
        {
            var paginationHeader = new PaginationHeader(currentPage, itemsPerPage, totalItems, totalPages);
            var serializeoptions = new JsonSerializerOptions {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };
            httpResponse.Headers.Add("Pagination", JsonSerializer.Serialize(paginationHeader, serializeoptions));
            httpResponse.Headers.Add("Access-Control-Expose-Headers", "Pagination");
        }
    }
}