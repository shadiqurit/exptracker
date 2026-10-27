package bd.shadiqur.exptracker;

import android.os.Bundle;
import androidx.core.view.WindowCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Ensure web content respects system status bar and navigation bar insets
        WindowCompat.setDecorFitsSystemWindows(getWindow(), true);
    }
}
