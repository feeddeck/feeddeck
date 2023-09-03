package app.feeddeck.feeddeck

import android.app.Activity
import android.content.Context
import android.content.Intent
import androidx.annotation.NonNull

import io.flutter.embedding.engine.plugins.FlutterPlugin
import io.flutter.plugin.common.*
import io.flutter.plugin.common.MethodChannel.*
import io.flutter.embedding.engine.plugins.activity.ActivityAware
import io.flutter.embedding.engine.plugins.FlutterPlugin.FlutterPluginBinding
import io.flutter.embedding.engine.plugins.activity.ActivityPluginBinding

import com.google.android.gms.auth.api.identity.BeginSignInRequest
import com.google.android.gms.auth.api.identity.Identity
import com.google.android.gms.auth.api.identity.SignInClient
import com.google.android.gms.common.api.ApiException

/**
 * Unfortunately we can not use the google_one_tap_sign_in since it doesn't work on web. Therefore we implement our own
 * plugin with a similar logic as in the package.
 *
 * See https://github.com/daewu14/google_one_tap_sign_in/blob/5ca6b8a51902e2cc4b361edd42e2c986ffbe2ff5/android/src/main/kotlin/id/daewu14/google_one_tap_sign_in/GoogleOneTapSignInPlugin.kt
 */
class FeedDeckPlugin : FlutterPlugin, MethodCallHandler, PluginRegistry.ActivityResultListener, ActivityAware {
  private lateinit var channel : MethodChannel

  private lateinit var oneTapClient: SignInClient
  private lateinit var signInRequest: BeginSignInRequest
  private lateinit var pluginBinding: FlutterPluginBinding

  private var activity: Activity? = null
  private var context: Context? = null
  private var webClientId: String? = null
  private var result: MethodChannel.Result? = null

  private var binding: ActivityPluginBinding? = null
  private val reqOneTap = 14081996

  override fun onAttachedToEngine(@NonNull flutterPluginBinding: FlutterPlugin.FlutterPluginBinding) {
    setupPlugin(null, flutterPluginBinding)
  }

  override fun onMethodCall(@NonNull call: MethodCall, @NonNull result: Result) {
    this.result = result

    if (call.method == "startSignIn") {
      webClientId = call.argument("webClientId")
      startSignIn()
    } else {
      result.notImplemented()
    }
  }

  override fun onDetachedFromEngine(@NonNull binding: FlutterPlugin.FlutterPluginBinding) {
    detachPlugin()
    channel.setMethodCallHandler(null)
  }

  private fun startSignIn() {
    if (webClientId == null) {
      return
    }

    if (result == null) {
      return
    }

    if (activity == null) {
      return
    }

    oneTapClient = Identity.getSignInClient(activity ?: return)
    oneTapClient.signOut()

    signInRequest = BeginSignInRequest.builder()
      .setPasswordRequestOptions(BeginSignInRequest.PasswordRequestOptions.builder().setSupported(true).build())
      .setGoogleIdTokenRequestOptions(BeginSignInRequest.GoogleIdTokenRequestOptions.builder().setSupported(true).setServerClientId(webClientId ?: return).setFilterByAuthorizedAccounts(false).build())
      .setAutoSelectEnabled(true)
      .build()

    oneTapClient.beginSignIn(signInRequest)
      .addOnSuccessListener { rss ->
        activity!!.startIntentSenderForResult(rss.pendingIntent.intentSender, reqOneTap, null, 0, 0, 0, null)
      }
      .addOnFailureListener { e ->
        result!!.error("START_SIGN_IN_FAILED", e.localizedMessage, null)
      }
      .addOnCanceledListener {
        result!!.error("START_SIGN_IN_FAILED", null, null)
      }
  }

  override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?): Boolean {
    if (binding == null) {
      return false
    }

    result?.let {
      when {
        requestCode == reqOneTap -> {
          if (data != null) {
            try {
              val credential = oneTapClient.getSignInCredentialFromIntent(data)
              val idToken = credential.googleIdToken

              it.success(idToken)
              return true
            } catch (e: ApiException) {
              it.error("SIGN_IN_FAILED", e.localizedMessage, null)
              return false
            }
          } else {
            it.error("SIGN_IN_FAILED", null, null)
            return false
          }
        }
        else -> {
          it.error("SIGN_IN_FAILED", null, null)
          return false
        }
      }
    }
    return false
  }

  override fun onAttachedToActivity(binding: ActivityPluginBinding) {
    setupPlugin(binding, null)
  }

  override fun onDetachedFromActivityForConfigChanges() {
    detachPlugin()
  }

  override fun onReattachedToActivityForConfigChanges(binding: ActivityPluginBinding) {
    onAttachedToActivity(binding)
  }

  override fun onDetachedFromActivity() {}

  private fun detachPlugin() {
    if (binding == null) {
      return
    }
    this.binding!!.removeActivityResultListener(this)
    this.binding = null
  }

  private fun setupPlugin(binding: ActivityPluginBinding?, flutterPluginBinding: FlutterPlugin.FlutterPluginBinding?) {
    flutterPluginBinding?.let {
      pluginBinding = it
    }

    pluginBinding.let {
      context = it.applicationContext
      channel = MethodChannel(it.binaryMessenger, "feeddeck.app")
      channel.setMethodCallHandler(this)
    }

    binding?.let {
      activity = it.activity
      this.binding = it
      this.binding!!.addActivityResultListener(this)
    }
  }
}
