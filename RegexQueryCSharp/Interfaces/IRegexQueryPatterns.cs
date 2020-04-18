using RegexQuery.Enums;

namespace RegexQuery.Interfaces
{
    public interface IRegexQueryPatterns
    {
        IRegexQuery ADate();

        IRegexQuery ADate( Separator separator = Separator.All );
    }
}
