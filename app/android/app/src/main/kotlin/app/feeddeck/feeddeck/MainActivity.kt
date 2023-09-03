package app.feeddeck.feeddeck

import android.content.Context
import androidx.annotation.NonNull
import com.ryanheise.audioservice.AudioServicePlugin
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine

class MainActivity: FlutterActivity() {
  @Override
  override fun provideFlutterEngine(context: Context): FlutterEngine {
    return AudioServicePlugin.getFlutterEngine(context)
  }

  override fun configureFlutterEngine(@NonNull flutterEngine: FlutterEngine) {
    super.configureFlutterEngine(flutterEngine)
    flutterEngine.plugins.add(FeedDeckPlugin())
  }
}
