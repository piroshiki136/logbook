from app.core.exceptions import unhandled_exception_handler


def test_unhandled_exception_returns_generic_message():
    response = unhandled_exception_handler(
        None,
        RuntimeError("database connection failed"),
    )

    assert response.status_code == 500
    assert response.body.decode() == (
        '{"error":{"code":"INTERNAL_SERVER_ERROR","message":"現在エラーが発生しています"}}'
    )
