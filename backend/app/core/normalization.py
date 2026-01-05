import unicodedata


def normalize_tag_key(value: str) -> str:
    normalized = unicodedata.normalize("NFKC", value).strip()
    return normalized.casefold()
