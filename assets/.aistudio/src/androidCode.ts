import { AndroidFile } from './types';

export const androidProjectFiles: AndroidFile[] = [
  {
    name: "AndroidManifest.xml",
    path: "app/src/main/AndroidManifest.xml",
    language: "xml",
    code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.jiku.cashmemo">

    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="28" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="28" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.JikuCashMemo">
        
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
        
        <activity android:name=".ProductActivity" />
        <activity android:name=".NewSaleActivity" />
        <activity android:name=".HistoryActivity" />
        
    </application>
</manifest>`
  },
  {
    name: "build.gradle (Module: app)",
    path: "app/build.gradle",
    language: "gradle",
    code: `plugins {
    id 'com.android.application'
    id 'kotlin-android'
    id 'kotlin-kapt'
}

android {
    namespace 'com.jiku.cashmemo'
    compileSdk 34

    defaultConfig {
        applicationId "com.jiku.cashmemo"
        minSdk 26
        targetSdk 34
        versionCode 1
        versionName "1.0"

        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = '17'
    }
    buildFeatures {
        viewBinding true
    }
}

dependencies {
    implementation 'androidx.core:core-ktx:1.12.0'
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.11.0'
    implementation 'androidx.constraintlayout:constraintlayout:2.1.4'

    // Room Database Components
    implementation "androidx.room:room-runtime:2.6.1"
    implementation "androidx.room:room-ktx:2.6.1"
    kapt "androidx.room:room-compiler:2.6.1"

    // Coroutines
    implementation "org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3"
}`
  },
  {
    name: "ProductEntity.kt (Database Model)",
    path: "app/src/main/java/com/jiku/cashmemo/db/ProductEntity.kt",
    language: "kotlin",
    code: `package com.jiku.cashmemo.db

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "products")
data class ProductEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val name: String,
    val price: Double,
    val category: String = ""
)`
  },
  {
    name: "SaleEntity.kt (Sales & Items Model)",
    path: "app/src/main/java/com/jiku/cashmemo/db/SaleEntity.kt",
    language: "kotlin",
    code: `package com.jiku.cashmemo.db

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "sales")
data class SaleEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val invoiceNo: String,
    val dateTimeStamp: Long, // unix milliseconds
    val subtotal: Double,
    val discount: Double,
    val grandTotal: Double,
    val cashReceived: Double,
    val changeReturn: Double
)

@Entity(tableName = "sale_items")
data class SaleItemEntity(
    @PrimaryKey(autoGenerate = true) val itemId: Long = 0,
    val saleParentId: Long,
    val productName: String,
    val quantity: Int,
    val priceAtSale: Double,
    val totalPrice: Double
)`
  },
  {
    name: "AppDatabase.kt (Room Initialization)",
    path: "app/src/main/java/com/jiku/cashmemo/db/AppDatabase.kt",
    language: "kotlin",
    code: `package com.jiku.cashmemo.db

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.sqlite.db.SupportSQLiteDatabase
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

@Database(
    entities = [ProductEntity::class, SaleEntity::class, SaleItemEntity::class],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun productDao(): ProductDao
    abstract fun saleDao(): SaleDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context, scope: CoroutineScope): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "jiku_cash_memo_db"
                )
                .addCallback(DatabaseCallback(scope))
                .build()
                INSTANCE = instance
                instance
            }
        }

        // Prepopulate standard database with requested items: Water = 1 SAR, Pepsi = 3 SAR, Bread = 2 SAR
        private class DatabaseCallback(
            private val scope: CoroutineScope
        ) : RoomDatabase.Callback() {
            override fun onCreate(db: SupportSQLiteDatabase) {
                super.onCreate(db)
                INSTANCE?.let { database ->
                    scope.launch(Dispatchers.IO) {
                        val productDao = database.productDao()
                        productDao.insert(ProductEntity(name = "Water", price = 1.0, category = "Beverages"))
                        productDao.insert(ProductEntity(name = "Pepsi", price = 3.0, category = "Beverages"))
                        productDao.insert(ProductEntity(name = "Bread", price = 2.0, category = "Bakery"))
                        productDao.insert(ProductEntity(name = "Milk 1L", price = 5.0, category = "Dairy"))
                        productDao.insert(ProductEntity(name = "Yogurt", price = 2.0, category = "Dairy"))
                    }
                }
            }
        }
    }
}`
  },
  {
    name: "ProductDao.kt & SaleDao.kt (Queries)",
    path: "app/src/main/java/com/jiku/cashmemo/db/Daos.kt",
    language: "kotlin",
    code: `package com.jiku.cashmemo.db

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface ProductDao {
    @Query("SELECT * FROM products ORDER BY name ASC")
    fun getAllProducts(): Flow<List<ProductEntity>>

    @Query("SELECT * FROM products WHERE name LIKE :searchQuery ORDER BY name ASC")
    fun searchProducts(searchQuery: String): Flow<List<ProductEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(product: ProductEntity)

    @Update
    suspend fun update(product: ProductEntity)

    @Delete
    suspend fun delete(product: ProductEntity)
}

@Dao
interface SaleDao {
    @Query("SELECT * FROM sales ORDER BY dateTimeStamp DESC")
    fun getAllSales(): Flow<List<SaleEntity>>

    @Query("SELECT * FROM sales WHERE dateTimeStamp >= :startTime AND dateTimeStamp <= :endTime ORDER BY dateTimeStamp DESC")
    fun getSalesByDateRange(startTime: Long, endTime: Long): Flow<List<SaleEntity>>

    @Insert
    suspend fun insertSale(sale: SaleEntity): Long

    @Insert
    suspend fun insertSaleItems(items: List<SaleItemEntity>)

    @Query("SELECT * FROM sale_items WHERE saleParentId = :saleId")
    suspend fun getItemsForSale(saleId: Long): List<SaleItemEntity>
}`
  },
  {
    name: "MainActivity.kt (POS Home Dashboard)",
    path: "app/src/main/java/com/jiku/cashmemo/MainActivity.kt",
    language: "kotlin",
    code: `package com.jiku.cashmemo

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.jiku.cashmemo.databinding.ActivityMainBinding

class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Title and branding setup
        binding.txtBranding.text = "Jiku Cash Memo"
        binding.txtSubtitle.text = "Bakala POS System"

        // Navigation setup
        binding.btnNewSale.setOnClickListener {
            startActivity(Intent(this, NewSaleActivity::class.java))
        }

        binding.btnProductManagement.setOnClickListener {
            startActivity(Intent(this, ProductActivity::class.java))
        }

        binding.btnSalesHistory.setOnClickListener {
            startActivity(Intent(this, HistoryActivity::class.java))
        }
    }
}`
  },
  {
    name: "NewSaleActivity.kt (Invoicing Engine)",
    path: "app/src/main/java/com/jiku/cashmemo/NewSaleActivity.kt",
    language: "kotlin",
    code: `package com.jiku.cashmemo

import android.content.Context
import android.os.Bundle
import android.widget.ArrayAdapter
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.jiku.cashmemo.db.*
import com.jiku.cashmemo.databinding.ActivityNewSaleBinding
import com.jiku.cashmemo.utils.PdfGenerator
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

class NewSaleActivity : AppCompatActivity() {
    private lateinit var binding: ActivityNewSaleBinding
    private lateinit var database: AppDatabase
    private val selectedItemsList = mutableListOf<SaleItemEntity>()
    private var availableProductsList = listOf<ProductEntity>()
    private var subtotalAmount = 0.0

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityNewSaleBinding.inflate(layoutInflater)
        setContentView(binding.root)

        database = AppDatabase.getDatabase(this, lifecycleScope)
        setupProductSearchAutoComplete()

        binding.btnAddToCart.setOnClickListener {
            addProductToCart()
        }

        binding.btnCalculate.setOnClickListener {
            calculateBill()
        }

        binding.btnSavePrint.setOnClickListener {
            saveSaleAndGeneratePdf()
        }
    }

    private fun setupProductSearchAutoComplete() {
        lifecycleScope.launch {
            database.productDao().getAllProducts().collect { products ->
                availableProductsList = products
                val productNamesEnAr = products.map { "\${it.name} - \${it.price} SAR" }
                val adapter = ArrayAdapter(
                    this@NewSaleActivity, 
                    android.R.layout.simple_dropdown_item_1line, 
                    productNamesEnAr
                )
                binding.actProductSearch.setAdapter(adapter)

                // Autofill price on item selection based on database
                binding.actProductSearch.setOnItemClickListener { _, _, position, _ ->
                    val selectedText = binding.actProductSearch.adapter.getItem(position) as String
                    val matchedProduct = availableProductsList.find { 
                        selectedText.startsWith(it.name) 
                    }
                    matchedProduct?.let {
                        binding.edtUnitPrice.setText(it.price.toString())
                        binding.edtQty.setText("1")
                    }
                }
            }
        }
    }

    private fun addProductToCart() {
        val searchVal = binding.actProductSearch.text.toString()
        val priceStr = binding.edtUnitPrice.text.toString()
        val qtyStr = binding.edtQty.text.toString()

        if (searchVal.isEmpty() || priceStr.isEmpty() || qtyStr.isEmpty()) {
            Toast.makeText(this, "Please select product and enter quantity", Toast.LENGTH_SHORT).show()
            return
        }

        val price = priceStr.toDoubleOrNull() ?: 0.0
        val qty = qtyStr.toIntOrNull() ?: 1
        val itemTotal = price * qty

        val matchedProduct = availableProductsList.find { searchVal.contains(it.name) }
        val productName = matchedProduct?.name ?: searchVal.split("-").first().trim()

        val item = SaleItemEntity(
            saleParentId = 0,
            productName = productName,
            quantity = qty,
            priceAtSale = price,
            totalPrice = itemTotal
        )

        selectedItemsList.add(item)
        subtotalAmount += itemTotal
        updateCartUi()

        binding.actProductSearch.text.clear()
        binding.edtUnitPrice.text.clear()
        binding.edtQty.text.clear()
    }

    private fun updateCartUi() {
        // Concatenates items simple text layout for preview helper
        val sb = StringBuilder()
        selectedItemsList.forEachIndexed { i, saleItem ->
            sb.append("\${i + 1}. \${saleItem.productName} \tx\${saleItem.quantity} \t\${saleItem.totalPrice} SAR\\n")
        }
        binding.txtCartDisplay.text = if (sb.isEmpty()) "Cart is empty." else sb.toString()
        binding.txtSubtotal.text = "Subtotal: \${String.format(Locale.US, "%.2f", subtotalAmount)} SAR"
        calculateBill()
    }

    private fun calculateBill() {
        val discountStr = binding.edtDiscount.text.toString()
        val discount = discountStr.toDoubleOrNull() ?: 0.0
        val grandTotal = (subtotalAmount - discount).coerceAtLeast(0.0)

        val cashStr = binding.edtCashReceived.text.toString()
        val cash = cashStr.toDoubleOrNull() ?: 0.0
        val change = (cash - grandTotal).coerceAtLeast(0.0)

        binding.txtGrandTotal.text = "Grand Total: \${String.format(Locale.US, "%.2f", grandTotal)} SAR"
        binding.txtChangeReturn.text = "Change: \${String.format(Locale.US, "%.2f", change)} SAR"
    }

    private fun saveSaleAndGeneratePdf() {
        if (selectedItemsList.isEmpty()) {
            Toast.makeText(this, "The billing cart is empty!", Toast.LENGTH_SHORT).show()
            return
        }

        val discount = binding.edtDiscount.text.toString().toDoubleOrNull() ?: 0.0
        val grandTotal = (subtotalAmount - discount).coerceAtLeast(0.0)
        val cashReceived = binding.edtCashReceived.text.toString().toDoubleOrNull() ?: 0.0
        val changeReturn = (cashReceived - grandTotal).coerceAtLeast(0.0)

        val invoiceNo = "INV-" + System.currentTimeMillis().toString().takeLast(6)
        val currentTimestamp = System.currentTimeMillis()

        lifecycleScope.launch {
            val saleObj = SaleEntity(
                invoiceNo = invoiceNo,
                dateTimeStamp = currentTimestamp,
                subtotal = subtotalAmount,
                discount = discount,
                grandTotal = grandTotal,
                cashReceived = cashReceived,
                changeReturn = changeReturn
            )

            val parentId = database.saleDao().insertSale(saleObj)
            val updatedItems = selectedItemsList.map { it.copy(saleParentId = parentId) }
            database.saleDao().insertSaleItems(updatedItems)

            Toast.makeText(this@NewSaleActivity, "Sale saved locally!", Toast.LENGTH_SHORT).show()

            // Trigger elegant PDF drawing
            val dateFormat = SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault())
            val dateStr = dateFormat.format(Date(currentTimestamp))

            PdfGenerator.generateAndPrintInvoice(
                this@NewSaleActivity,
                invoiceNo,
                dateStr,
                updatedItems,
                subtotalAmount,
                discount,
                grandTotal,
                cashReceived,
                changeReturn
            )

            // Reset and finish page
            selectedItemsList.clear()
            subtotalAmount = 0.0
            finish()
        }
    }
}`
  },
  {
    name: "PdfGenerator.kt (PDF and Print Core)",
    path: "app/src/main/java/com/jiku/cashmemo/utils/PdfGenerator.kt",
    language: "kotlin",
    code: `package com.jiku.cashmemo.utils

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.pdf.PdfDocument
import android.os.Bundle
import android.os.CancellationSignal
import android.os.ParcelFileDescriptor
import android.print.PageRange
import android.print.PrintAttributes
import android.print.PrintDocumentAdapter
import android.print.PrintManager
import android.widget.Toast
import com.jiku.cashmemo.db.SaleItemEntity
import java.io.FileOutputStream
import java.io.IOException

object PdfGenerator {

    fun generateAndPrintInvoice(
        context: Context,
        invoiceNo: String,
        dateTimeStr: String,
        items: List<SaleItemEntity>,
        subtotal: Double,
        discount: Double,
        grandTotal: Double,
        cashReceived: Double,
        changeReturn: Double
    ) {
        val printManager = context.getSystemService(Context.PRINT_SERVICE) as PrintManager
        val jobName = "JikuCashMemo_\${invoiceNo}"

        printManager.print(jobName, object : PrintDocumentAdapter() {
            override fun onLayout(
                oldAttributes: PrintAttributes?,
                newAttributes: PrintAttributes,
                cancellationSignal: CancellationSignal?,
                callback: LayoutResultCallback,
                extras: Bundle?
            ) {
                if (cancellationSignal?.isCanceled == true) {
                    callback.onLayoutCancelled()
                    return
                }

                // Generates dynamic layout parameters corresponding to standard receipt rolls (3-inch wide print roll layout)
                val builder = PrintDocumentInfo.Builder(jobName)
                    .setContentType(PrintDocumentInfo.CONTENT_TYPE_DOCUMENT)
                    .setPageCount(1)

                callback.onLayoutFinished(builder.build(), true)
            }

            override fun onWrite(
                pages: Array<out PageRange>?,
                destination: ParcelFileDescriptor?,
                cancellationSignal: CancellationSignal?,
                callback: WriteResultCallback
            ) {
                val pdfDocument = PdfDocument()
                // A standard printed page: 300px width (thermal roll equivalent) and tailored dynamic height
                val pageHeight = 500 + (items.size * 30)
                val pageInfo = PdfDocument.PageInfo.Builder(380, pageHeight, 1).create()
                val page = pdfDocument.startPage(pageInfo)
                val canvas = page.canvas

                val paint = Paint()
                val textPaint = Paint().apply {
                    color = Color.BLACK
                    textSize = 14f
                    isAntiAlias = true
                }

                val titlePaint = Paint().apply {
                    color = Color.BLACK
                    textSize = 18f
                    isFakeBoldText = true
                    textAlign = Paint.Align.CENTER
                }

                val greenPaint = Paint().apply {
                    color = Color.parseColor("#1B5E20") // Theme Green
                    strokeWidth = 2f
                }

                // Header
                canvas.drawText("JIKU CASH MEMO", 190f, 40f, titlePaint)
                textPaint.textSize = 11f
                textPaint.textAlign = Paint.Align.CENTER
                canvas.drawText("Al-Malaz District, Riyadh, Saudi Arabia", 190f, 60f, textPaint)
                canvas.drawText("Mob: +966 500000000", 190f, 75f, textPaint)
                
                canvas.drawLine(20f, 90f, 360f, 90f, greenPaint)

                // Info Rows
                textPaint.textAlign = Paint.Align.LEFT
                canvas.drawText("Invoice: \${invoiceNo}", 25f, 110f, textPaint)
                canvas.drawText("Date: \${dateTimeStr}", 25f, 125f, textPaint)

                canvas.drawLine(20f, 140f, 360f, 140f, greenPaint)

                // Item Header Row
                textPaint.isFakeBoldText = true
                canvas.drawText("Item Name", 25f, 160f, textPaint)
                canvas.drawText("Qty", 210f, 160f, textPaint)
                canvas.drawText("Price", 260f, 160f, textPaint)
                canvas.drawText("Total", 310f, 160f, textPaint)
                textPaint.isFakeBoldText = false

                canvas.drawLine(20f, 170f, 360f, 170f, paint)

                // Loop through items
                var yPos = 190f
                for (item in items) {
                    val displayName = if (item.productName.length > 18) item.productName.take(16) + ".." else item.productName
                    canvas.drawText(displayName, 25f, yPos, textPaint)
                    canvas.drawText(item.quantity.toString(), 215f, yPos, textPaint)
                    canvas.drawText(String.format("%.1f", item.priceAtSale), 260f, yPos, textPaint)
                    canvas.drawText(String.format("%.1f", item.totalPrice), 310f, yPos, textPaint)
                    yPos += 25f
                }

                canvas.drawLine(20f, yPos - 10f, 360f, yPos - 10f, paint)

                // Summary calculations
                canvas.drawText("Subtotal:", 180f, yPos + 10f, textPaint)
                canvas.drawText(String.format("%.2f SAR", subtotal), 290f, yPos + 10f, textPaint)

                canvas.drawText("Discount:", 180f, yPos + 25f, textPaint)
                canvas.drawText(String.format("%.2f SAR", discount), 290f, yPos + 25f, textPaint)

                textPaint.isFakeBoldText = true
                canvas.drawText("GRAND TOTAL:", 180f, yPos + 45f, textPaint)
                canvas.drawText(String.format("%.2f SAR", grandTotal), 290f, yPos + 45f, textPaint)
                textPaint.isFakeBoldText = false

                canvas.drawLine(20f, yPos + 55f, 360f, yPos + 55f, greenPaint)

                canvas.drawText("Cash Received:", 180f, yPos + 75f, textPaint)
                canvas.drawText(String.format("%.2f SAR", cashReceived), 290f, yPos + 75f, textPaint)

                canvas.drawText("Change Given:", 180f, yPos + 90f, textPaint)
                canvas.drawText(String.format("%.2f SAR", changeReturn), 290f, yPos + 90f, textPaint)

                // Footer
                val footerPaint = Paint().apply {
                    color = Color.DKGRAY
                    textSize = 10f
                    textAlign = Paint.Align.CENTER
                }
                canvas.drawText("Thank You for Shopping with Us!", 190f, yPos + 120f, footerPaint)
                canvas.drawText("Powered by Jiku Cash Memo System", 190f, yPos + 135f, footerPaint)

                pdfDocument.finishPage(page)

                try {
                    val stream = FileOutputStream(destination?.fileDescriptor)
                    pdfDocument.writeTo(stream)
                } catch (e: IOException) {
                    Toast.makeText(context, "Failed to write PDF: \${e.message}", Toast.LENGTH_LONG).show()
                } finally {
                    pdfDocument.close()
                }

                callback.onWriteFinished(arrayOf(PageRange.ALL_PAGES))
            }
        }, null)
    }
}`
  },
  {
    name: "activity_main.xml (Main XML)",
    path: "app/src/main/res/layout/activity_main.xml",
    language: "xml",
    code: `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_match"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:gravity="center_horizontal"
    android:background="#FAFAFA"
    android:padding="24dp">

    <!-- Green Header Area -->
    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="vertical"
        android:gravity="center"
        android:background="@drawable/green_header_bg"
        android:padding="20dp"
        android:layout_marginBottom="32dp">

        <TextView
            android:id="@+id/txtBranding"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="Jiku Cash Memo"
            android:textColor="#FFFFFF"
            android:textSize="28sp"
            android:textStyle="bold" />

        <TextView
            android:id="@+id/txtSubtitle"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="Grocery &amp; Bakala Smart POS"
            android:textColor="#C8E6C9"
            android:textSize="14sp" />
    </LinearLayout>

    <!-- POS Large Action Buttons -->
    <Button
        android:id="@+id/btnNewSale"
        android:layout_width="match_parent"
        android:layout_height="72dp"
        android:layout_marginBottom="16dp"
        android:backgroundTint="#2E7D32"
        android:text="NEW SALE (بيع جديد)"
        android:textColor="#FFFFFF"
        android:textSize="18sp"
        android:textStyle="bold" />

    <Button
        android:id="@+id/btnProductManagement"
        android:layout_width="match_parent"
        android:layout_height="72dp"
        android:layout_marginBottom="16dp"
        android:backgroundTint="#4CAF50"
        android:text="PRODUCTS DIRECTORY"
        android:textColor="#FFFFFF"
        android:textSize="18sp" />

    <Button
        android:id="@+id/btnSalesHistory"
        android:layout_width="match_parent"
        android:layout_height="72dp"
        android:layout_marginBottom="32dp"
        android:backgroundTint="#388E3C"
        android:text="SALES LOGS (سجل فواتير)"
        android:textColor="#FFFFFF"
        android:textSize="18sp" />

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Jiku Cash Memo POS • Offline Local DB Secured"
        android:textColor="#888888"
        android:textSize="12sp" />
</LinearLayout>`
  },
  {
    name: "activity_new_sale.xml (Invoicing Layout XML)",
    path: "app/src/main/res/layout/activity_new_sale.xml",
    language: "xml",
    code: `<?xml version="1.0" encoding="utf-8"?>
<ScrollView xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:fillViewport="true"
    android:background="#FAF8F6">

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="vertical"
        android:padding="16dp">

        <!-- Title -->
        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="New Sale Invoice"
            android:textSize="22sp"
            android:textStyle="bold"
            android:textColor="#1B5E20"
            android:layout_marginBottom="16dp"/>

        <!-- Add Item Row -->
        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:orientation="horizontal"
            android:gravity="center_vertical"
            android:layout_marginBottom="12dp">

            <AutoCompleteTextView
                android:id="@+id/actProductSearch"
                android:layout_width="0dp"
                android:layout_height="52dp"
                android:layout_weight="2"
                android:hint="Type product name (e.g. Bread)"
                android:background="@drawable/edittext_border"
                android:padding="8dp"
                android:layout_marginEnd="6dp" />

            <EditText
                android:id="@+id/edtUnitPrice"
                android:layout_width="0dp"
                android:layout_height="52dp"
                android:layout_weight="1"
                android:hint="Price"
                android:inputType="numberDecimal"
                android:background="@drawable/edittext_border"
                android:padding="8dp"
                android:layout_marginEnd="6dp" />

            <EditText
                android:id="@+id/edtQty"
                android:layout_width="0dp"
                android:layout_height="52dp"
                android:layout_weight="0.8"
                android:hint="Qty"
                android:inputType="number"
                android:background="@drawable/edittext_border"
                android:padding="8dp"/>
        </LinearLayout>

        <Button
            android:id="@+id/btnAddToCart"
            android:layout_width="match_parent"
            android:layout_height="52dp"
            android:text="ADD TO BILL (+)"
            android:backgroundTint="#2E7D32"
            android:textColor="#FFFFFF"
            android:layout_marginBottom="16dp"/>

        <!-- Cart Display Box -->
        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="Current Items Log"
            android:textStyle="bold"
            android:textColor="#444"
            android:layout_marginBottom="4dp"/>

        <TextView
            android:id="@+id/txtCartDisplay"
            android:layout_width="match_parent"
            android:layout_height="140dp"
            android:background="#E8F5E9"
            android:padding="10dp"
            android:text="Cart is empty."
            android:fontFamily="monospace"
            android:textColor="#1B5E20"
            android:layout_marginBottom="16dp"/>

        <!-- Money calculations -->
        <TextView
            android:id="@+id/txtSubtotal"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="Subtotal: 0.00 SAR"
            android:textSize="16sp"
            android:layout_marginBottom="8dp"/>

        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:orientation="horizontal"
            android:gravity="center_vertical"
            android:layout_marginBottom="8dp">

            <TextView
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="Discount (SAR): "
                android:textSize="16sp"/>

            <EditText
                android:id="@+id/edtDiscount"
                android:layout_width="match_parent"
                android:layout_height="48dp"
                android:inputType="numberDecimal"
                android:hint="0.00"
                android:background="@drawable/edittext_border"
                android:padding="8dp"/>
        </LinearLayout>

        <TextView
            android:id="@+id/txtGrandTotal"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="Grand Total: 0.00 SAR"
            android:textSize="18sp"
            android:textStyle="bold"
            android:textColor="#2E7D32"
            android:layout_marginBottom="12dp"/>

        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:orientation="horizontal"
            android:gravity="center_vertical"
            android:layout_marginBottom="12dp">

            <TextView
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="Cash Received: "
                android:textSize="16sp"/>

            <EditText
                android:id="@+id/edtCashReceived"
                android:layout_width="match_parent"
                android:layout_height="48dp"
                android:inputType="numberDecimal"
                android:hint="Enter cash amount"
                android:background="@drawable/edittext_border"
                android:padding="8dp"/>
        </LinearLayout>

        <Button
            android:id="@+id/btnCalculate"
            android:layout_width="match_parent"
            android:layout_height="48dp"
            android:text="CALCULATE CHANGE"
            android:backgroundTint="#4CAF50"
            android:textColor="#FFFFFF"
            android:layout_marginBottom="12dp"/>

        <TextView
            android:id="@+id/txtChangeReturn"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="Change: 0.00 SAR"
            android:textSize="18sp"
            android:textColor="#D84315"
            android:textStyle="bold"
            android:layout_marginBottom="24dp"/>

        <Button
            android:id="@+id/btnSavePrint"
            android:layout_width="match_parent"
            android:layout_height="62dp"
            android:text="SAVE &amp; GENERATE PRINT MEMO"
            android:textSize="16sp"
            android:textStyle="bold"
            android:backgroundTint="#1B5E20"
            android:textColor="#FFFFFF"/>

    </LinearLayout>
</ScrollView>`
  }
];
