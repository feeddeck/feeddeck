/// The [ApiException] class implements the [Exception] class and is used to
/// handle exceptions that occur during calls of an edge function. An
/// [ApiException] contains the returned error [message] and status code of the
/// edge function call.
class ApiException implements Exception {
  final String message;
  final int? statusCode;

  const ApiException(
    this.message,
    this.statusCode,
  );

  @override
  String toString() =>
      'ApiException(message: $message, statusCode: $statusCode)';
}
