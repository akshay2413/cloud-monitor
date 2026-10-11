using CloudMonitor.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CloudMonitor.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CloudResourcesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CloudResourcesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/CloudResources
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CloudResource>>> GetResources()
        {
            return await _context.CloudResources.ToListAsync();
        }

        // GET: api/CloudResources/1
        [HttpGet("{id}")]
        public async Task<ActionResult<CloudResource>> GetResource(int id)
        {
            var resource = await _context.CloudResources.FindAsync(id);

            if (resource == null)
            {
                return NotFound();
            }

            return resource;
        }

        // POST: api/CloudResources
        [HttpPost]
        public async Task<ActionResult<CloudResource>> CreateResource(CloudResource resource)
        {
            _context.CloudResources.Add(resource);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetResource),
                new { id = resource.Id },
                resource
            );
        }

        // PUT: api/CloudResources/1
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateResource(
            int id,
            CloudResource resource)
        {
            var existingResource = await _context.CloudResources.FindAsync(id);

            if (existingResource == null)
            {
                return NotFound();
            }

            existingResource.Name = resource.Name;
            existingResource.Provider = resource.Provider;
            existingResource.Status = resource.Status;
            existingResource.CpuUsage = resource.CpuUsage;
            existingResource.MemoryUsage = resource.MemoryUsage;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/CloudResources/1
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteResource(int id)
        {
            var resource = await _context.CloudResources.FindAsync(id);

            if (resource == null)
            {
                return NotFound();
            }

            _context.CloudResources.Remove(resource);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}