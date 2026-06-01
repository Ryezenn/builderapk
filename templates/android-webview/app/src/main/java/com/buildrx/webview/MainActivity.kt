package com.buildrx.webview

import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.Color
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.webkit.*
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    
    private lateinit var webView: WebView
    private val WEBSITE_URL = "{{WEBSITE_URL}}"  // Injected at compile time
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Dynamic status bar styling
        try {
            window.statusBarColor = Color.parseColor("{{STATUS_BAR_COLOR}}")
        } catch (e: Exception) {
            window.statusBarColor = Color.BLACK
        }
        
        // Simple programmatically injected layout (or inflated from activity_main.xml)
        webView = WebView(this)
        setContentView(webView)
        
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            loadsImagesAutomatically = true
            allowFileAccess = true
            setSupportZoom(false)
            mediaPlaybackRequiresUserGesture = false
            mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            cacheMode = WebSettings.LOAD_DEFAULT
            userAgentString = "$userAgentString BuildrX/1.0"
        }
        
        webView.webViewClient = object : WebViewClient() {
            override fun onPageStarted(view: WebView, url: String, favicon: Bitmap?) {
                super.onPageStarted(view, url, favicon)
                // Hook to display progress bar if necessary
            }
            
            override fun onReceivedError(
                view: WebView,
                request: WebResourceRequest,
                error: WebResourceError
            ) {
                if ("{{OFFLINE_PAGE}}" == "true") {
                    view.loadUrl("file:///android_asset/offline.html")
                }
            }
            
            override fun shouldOverrideUrlLoading(
                view: WebView, 
                request: WebResourceRequest
            ): Boolean {
                val url = request.url.toString()
                return if (url.startsWith("http://") || url.startsWith("https://")) {
                    false  // Load internally inside WebView
                } else {
                    // Open in external handler (e.g. mailto, tel, intents)
                    try {
                        startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                    } catch (e: Exception) {
                        Log.e("WebView", "Error launching external intent handler: " + e.message)
                    }
                    true
                }
            }
        }
        
        webView.addJavascriptInterface(AndroidBridge(this), "AndroidBridge")
        webView.loadUrl(WEBSITE_URL)
    }
    
    override fun onBackPressed() {
        if ("{{ALLOW_BACK}}" == "true" && webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}

// Native Javascript Bridge mappings
class AndroidBridge(private val context: Context) {
    @JavascriptInterface
    fun onEvent(event: String, data: String) {
        Log.d("Bridge", "Event received: $event | Data: $data")
    }
    
    @JavascriptInterface
    fun showToast(message: String) {
        Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
    }
    
    @JavascriptInterface
    fun getAppVersion(): String {
        return "1.0.0"
    }
}
