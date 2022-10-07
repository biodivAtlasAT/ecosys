val ktor_version: String by project
val kotlin_version: String by project
val logback_version: String by project
val jsoup_version: String by project
val hikaricp_version: String by project
val postgresql_version: String by project
val flyway_version: String by project
val exposed_version: String by project

plugins {
    application
    kotlin("jvm") version "1.7.10"
    id("io.ktor.plugin") version "2.1.1"
    id("org.jetbrains.kotlin.plugin.serialization") version "1.7.10"
    id("org.flywaydb.flyway") version "9.4.0"
}

group = "at.duk"
version = "0.0.1"
application {
    mainClass.set("at.duk.ApplicationKt")

    val isDevelopment: Boolean = project.ext.has("development")
    applicationDefaultJvmArgs = listOf("-Dio.ktor.development=$isDevelopment")
}

repositories {
    mavenCentral()
    maven { url = uri("https://maven.pkg.jetbrains.space/kotlin/p/kotlin/kotlin-js-wrappers") }
}

// only for using as gradle tasks!!!
flyway {
    url = "jdbc:postgresql://localhost:5432/ecosys"
    user = "postgres"
    password = "postgres"
    schemas = arrayOf("public")
    cleanDisabled = false
//    schemas = ['schema1', 'schema2', 'schema3']
 //   placeholders = [
 //       'keyABC': 'valueXYZ',
 //   'otherplaceholder': 'value123'
 //   ]
}

dependencies {
    implementation("io.ktor:ktor-server-core-jvm:$ktor_version")
    implementation("io.ktor:ktor-server-host-common-jvm:$ktor_version")
    implementation("io.ktor:ktor-server-content-negotiation-jvm:$ktor_version")
    implementation("org.jetbrains.kotlinx:kotlinx-html-jvm:0.8.0")
    implementation("io.ktor:ktor-server-html-builder-jvm:$ktor_version")
    implementation("org.jetbrains:kotlin-css-jvm:1.0.0-pre.129-kotlin-1.4.20")
    implementation("io.ktor:ktor-serialization-kotlinx-json-jvm:$ktor_version")
    implementation("io.ktor:ktor-server-netty-jvm:$ktor_version")
    implementation("ch.qos.logback:logback-classic:$logback_version")
    testImplementation("io.ktor:ktor-server-tests-jvm:$ktor_version")
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit:$kotlin_version")
    implementation("org.jsoup:jsoup:$jsoup_version")
    implementation("io.ktor:ktor-client-cio:$ktor_version")
    implementation("io.ktor:ktor-server-freemarker:$ktor_version")
    implementation ("com.zaxxer:HikariCP:$hikaricp_version") // JDBC Connection Pool
    implementation ("org.postgresql:postgresql:$postgresql_version") // JDBC Connector for PostgreSQL
    implementation("org.flywaydb:flyway-core:$flyway_version")
    implementation ("org.jetbrains.exposed:exposed-core:$exposed_version")
    implementation ("org.jetbrains.exposed:exposed-dao:$exposed_version")
    implementation ("org.jetbrains.exposed:exposed-jdbc:$exposed_version")
    implementation ("org.jetbrains.exposed:exposed-java-time:$exposed_version")
    implementation("com.bkahlert:koodies:1.6.2")





}