package at.duk.utils

import io.ktor.server.config.*

class CasConfig(config: ApplicationConfig) {
    val redirectToLoginUrl = config.propertyOrNull("cas.redirectToLoginUrl")?.getString() ?: ""
    val validationUrl = config.propertyOrNull("cas.validationUrl")?.getString() ?: ""
    val enabled = config.propertyOrNull("cas.enabled")?.getString().toBoolean()
    val protectedRoutes: MutableMap<String, List<String>> = mutableMapOf()
    val behindAProxy = config.propertyOrNull("cas.behindAProxy")?.getString().toBoolean()

    init {
        config.configList("cas.protectedRoutes").forEach { applicationConfig ->
            applicationConfig.keys().forEach {
                protectedRoutes[it.replace("\"", "")] = applicationConfig.tryGetStringList(it)?.toList()?: emptyList()
            }
        }
    }
}