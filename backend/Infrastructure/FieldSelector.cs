using System.Reflection;
using System.Runtime.Serialization;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace backend.Infrastructure
{
  public static class FieldSelector
  {
    public static object Project<TModel, TField>(TModel model, ICollection<TField>? fields)
      where TField : struct, Enum
    {
      if (fields is null || fields.Count == 0)
      {
        return model!;
      }

      var selectedFields = fields
        .Select(GetFieldName)
        .Where(name => !string.IsNullOrWhiteSpace(name))
        .ToHashSet(StringComparer.OrdinalIgnoreCase);

      var serialized = JsonSerializer.SerializeToNode(model) as JsonObject;
      if (serialized is null)
      {
        return model!;
      }

      var projected = new JsonObject();
      foreach (var property in serialized)
      {
        if (selectedFields.Contains(property.Key))
        {
          projected[property.Key] = property.Value?.DeepClone();
        }
      }

      return projected;
    }

    private static string GetFieldName<TField>(TField field)
      where TField : struct, Enum
    {
      var member = typeof(TField).GetMember(field.ToString()).FirstOrDefault();
      var enumMemberValue = member?.GetCustomAttribute<EnumMemberAttribute>()?.Value;

      if (!string.IsNullOrWhiteSpace(enumMemberValue))
      {
        return enumMemberValue;
      }

      var name = field.ToString();
      return string.IsNullOrEmpty(name)
        ? string.Empty
        : char.ToLowerInvariant(name[0]) + name[1..];
    }
  }
}
