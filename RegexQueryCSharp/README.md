# RegexQuery

Regular expressions in english.

---

### Installing

`dotnet add package RegexQuery`

&nbsp;

### Example

```c
public static void Main()
{
    string regexQuery1 = new RegexQuery().ADate()
                                         .BeginFollowedBy()
                                             .ASpace()
                                             .ANewLine()
                                         .EndGroup()
                                         .ToString();
}
```
