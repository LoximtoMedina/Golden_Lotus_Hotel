using Microsoft.EntityFrameworkCore;

namespace backend.Infrastructure
{
    public class Repository<T> where T : class
    {
        private readonly AppDbContext _context;
        private readonly DbSet<T> _dbSet;
        public Repository(AppDbContext context)
        {
            _context = context;
            _dbSet = _context.Set<T>();
        }
        public async Task<T> GetById(int id)
        {
            T? element = await _dbSet.FirstOrDefaultAsync(entity => EF.Property<int>(entity, "Id") == id);
            if (element == null)
            {
                throw new Exception($"Element with id {id} not found");
            }
            return element;
        }

        public async Task<List<T>> GetAll()
        {
            return await _dbSet.ToListAsync();
        }

        public async Task Create(T entity)
        {
            _dbSet.Add(entity);
            await _context.SaveChangesAsync();
        }

        public async Task Update(int Id, T entity)
        {
            T? element = await _dbSet.FindAsync(Id);
            if (element == null)
            {
                throw new Exception($"Element with id {Id} not found");
            }
            _context.Entry(element).CurrentValues.SetValues(entity);
            await _context.SaveChangesAsync();
        }

        public async Task Delete(int id)
        {
            T? element = await _dbSet.FindAsync(id);
            if (element == null)
            {
                throw new Exception($"Element with id {id} not found");
            }

            _context.Entry(element).Property("Active").CurrentValue = false;
            await _context.SaveChangesAsync();
        }

        public async Task Restore(int id)
        {
            T? element = await _dbSet.FindAsync(id);
            if (element == null)
            {
                throw new Exception($"Element with id {id} not found");
            }

            _context.Entry(element).Property("Active").CurrentValue = true;
            await _context.SaveChangesAsync();
        }
    }
}
