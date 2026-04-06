using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace backend.Infrastructure
{
  public abstract class CrudServiceBase<TEntity, TId> where TEntity : class
  {
    private const int DefaultMaxRetries = 3;
    private static readonly TimeSpan BaseDelay = TimeSpan.FromMilliseconds(200);
    private readonly ILogger _logger;

    protected CrudServiceBase(ILogger logger)
    {
      _logger = logger;
    }

    //#region Public CRUD methods
    public Task<List<TEntity>> ReadAllAsync()
    {
      return ExecuteWithRetryAsync(HandleReadAllAsync, "read all");
    }

    public Task<TEntity> ReadAsync(TId id)
    {
      return ExecuteWithRetryAsync(() => HandleReadAsync(id), "read");
    }

    public Task CreateAsync(TEntity entity)
    {
      return ExecuteWithRetryAsync(() => HandleCreateAsync(entity), "create");
    }

    public Task UpdateAsync(TId id, TEntity entity)
    {
      return ExecuteWithRetryAsync(() => HandleUpdateAsync(id, entity), "update");
    }

    public Task DeleteAsync(TId id)
    {
      return ExecuteWithRetryAsync(() => HandleDeleteAsync(id), "delete");
    }

    public Task RestoreAsync(TId id)
    {
      return ExecuteWithRetryAsync(() => HandleRestoreAsync(id), "restore");
    }
    //#endregion

    // #region Abstract handlers for CRUD operations 
    protected abstract Task<List<TEntity>> HandleReadAllAsync();
    protected abstract Task<TEntity> HandleReadAsync(TId id);
    protected abstract Task HandleCreateAsync(TEntity entity);
    protected abstract Task HandleUpdateAsync(TId id, TEntity entity);
    protected abstract Task HandleDeleteAsync(TId id);
    protected abstract Task HandleRestoreAsync(TId id);
    //#endregion

    // #region Retry logic 
    // Helper method for operations that don't return a result (if it works it works)
    private async Task ExecuteWithRetryAsync(Func<Task> operation, string operationName)
    {
      await ExecuteWithRetryAsync(async () =>
      {
        await operation();
        return true;
      }, operationName);
    }

    // Overload for operations that return a result
    private async Task<TResult> ExecuteWithRetryAsync<TResult>(Func<Task<TResult>> operation, string operationName)
    {
      int attempt = 0;

      while (true)
      {
        try
        {
          return await operation();
        }
        catch (Exception ex) when (IsTransient(ex) && attempt < DefaultMaxRetries - 1)
        {
          attempt++;
          TimeSpan delay = TimeSpan.FromMilliseconds(BaseDelay.TotalMilliseconds * attempt);
          _logger.LogWarning(ex, "Transient error on {Entity} {Operation}. Attempt {Attempt}/{MaxAttempts}.", typeof(TEntity).Name, operationName, attempt, DefaultMaxRetries);
          await Task.Delay(delay);
        }
        catch (Exception ex)
        {
          _logger.LogError(ex, "Failed to {Operation} {Entity}.", operationName, typeof(TEntity).Name);
          throw CreateServiceException(operationName, ex);
        }
      }
    }

    protected virtual bool IsTransient(Exception ex)
    {
      return ex is TimeoutException || ex is DbUpdateException;
    }

    protected virtual Exception CreateServiceException(string operationName, Exception ex)
    {
      return new InvalidOperationException($"Unable to {operationName} {typeof(TEntity).Name}.", ex);
    }
    //#endregion
  }
}