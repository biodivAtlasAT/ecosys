/*
 * Copyright (C) 2022 Danube University Krems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 * License-Filename: LICENSE
 */
import io.gitlab.arturbosch.detekt.Detekt

val ktorVersion: String by project
val kotlinVersion: String by project
val logbackVersion: String by project
val jsoupVersion: String by project
val hikaricpVersion: String by project
val postgresqlVersion: String by project
val flywayVersion: String by project
val exposedVersion: String by project
val koodiesVersion: String by project
val jacksonVersion: String by project
val detektPluginVersion: String by project
val log4jVersion: String by project
val detektFormattingVersion: String by project

plugins {
    application
    kotlin("jvm") version "1.7.10"
    id("io.ktor.plugin") version "2.1.1"
    id("org.jetbrains.kotlin.plugin.serialization") version "1.7.10"
    id("org.flywaydb.flyway") version "9.4.0"
    id("io.gitlab.arturbosch.detekt").version("1.21.0")
}

group = "at.duk"
version = "0.0.1"
application {
    mainClass.set("at.duk.ApplicationKt")

    val isDevelopment: Boolean = project.ext.has("development")
    applicationDefaultJvmArgs = listOf("-Dio.ktor.development=$isDevelopment")
}

repositories {
    /* if geotools are needed in implementation section
         maven { url = uri("https://repository.jboss.org/maven2/") }
         maven { url = uri("https://repo.osgeo.org/repository/release") }
         maven { url = uri("https://repo.osgeo.org/repository/geotools-releases/") }
    */
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
}

apply(plugin = "io.gitlab.arturbosch.detekt")
detekt {
    // Align the detekt core and plugin versions.
    toolVersion = detektPluginVersion

    // Only configure differences to the default.
    buildUponDefaultConfig = true
    config = files("$rootDir/.detekt.yml")

    source.from(fileTree(".") { include("*.gradle.kts") }, "src/funTest/kotlin")

    basePath = rootProject.projectDir.path
}

tasks.withType<Detekt> detekt@{
    reports {
        html.required.set(false)
        sarif.required.set(true)
        txt.required.set(false)
        xml.required.set(true)
    }
}

dependencies {
    implementation("org.jetbrains.kotlinx:kotlinx-html-jvm:0.8.0")
    implementation("org.jetbrains:kotlin-css-jvm:1.0.0-pre.129-kotlin-1.4.20")
    implementation("ch.qos.logback:logback-classic:$logbackVersion")
    implementation("org.jsoup:jsoup:$jsoupVersion")
    implementation("com.zaxxer:HikariCP:$hikaricpVersion") // JDBC Connection Pool
    implementation("org.postgresql:postgresql:$postgresqlVersion") // JDBC Connector for PostgreSQL
    implementation("org.flywaydb:flyway-core:$flywayVersion")
    implementation("org.jetbrains.exposed:exposed-core:$exposedVersion")
    implementation("org.jetbrains.exposed:exposed-dao:$exposedVersion")
    implementation("org.jetbrains.exposed:exposed-jdbc:$exposedVersion")
    implementation("org.jetbrains.exposed:exposed-java-time:$exposedVersion")
    implementation("com.bkahlert:koodies:$koodiesVersion")
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin:$jacksonVersion")

    implementation("org.apache.logging.log4j:log4j-api:$log4jVersion")
    implementation("org.apache.logging.log4j:log4j-core:$log4jVersion")
    implementation("io.ktor:ktor-server-core-jvm:2.2.4")
    implementation("io.ktor:ktor-server-host-common-jvm:2.2.4")
    implementation("io.ktor:ktor-server-content-negotiation-jvm:2.2.4")
    implementation("io.ktor:ktor-server-swagger:2.2.4")
    implementation("io.ktor:ktor-server-html-builder-jvm:2.2.4")
    implementation("io.ktor:ktor-serialization-kotlinx-json-jvm:2.2.4")
    implementation("io.ktor:ktor-server-netty-jvm:2.2.4")
    implementation("io.ktor:ktor-server-sessions-jvm:2.2.4")
    implementation("io.ktor:ktor-client-cio-jvm:2.2.4")
    implementation("io.ktor:ktor-server-freemarker:2.2.4")
    implementation("io.ktor:ktor-server-cors:2.2.4")
    testImplementation("io.ktor:ktor-server-tests-jvm:2.2.4")
    detektPlugins("io.gitlab.arturbosch.detekt:detekt-formatting:$detektFormattingVersion")

    testImplementation("org.jetbrains.kotlin:kotlin-test-junit:$kotlinVersion")
}
