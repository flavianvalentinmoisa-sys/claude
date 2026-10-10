from main import salut


def test_salut_implicit():
    assert salut() == "Salut, lume!"


def test_salut_cu_nume():
    assert salut("Flavian") == "Salut, Flavian!"
