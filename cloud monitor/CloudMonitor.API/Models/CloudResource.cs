namespace CloudMonitor.API.Models
{
    public class CloudResource
    {
        public int Id { get; set; }

        public string Name { get; set; } = "";

        public string Provider { get; set; } = "";

        public string Status { get; set; } = "";

        public double CpuUsage { get; set; }

        public double MemoryUsage { get; set; }
    }
}