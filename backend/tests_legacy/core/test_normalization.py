from app.core.normalization import normalize_tag_key


def test_normalize_tag_key_nfkc_and_casefold():
    assert normalize_tag_key(" Ｃ＋＋ ") == "c++"


def test_normalize_tag_key_trims_and_lowercases():
    assert normalize_tag_key("  Python ") == "python"
