package at.duk.utils

import at.duk.models.biotop.ProjectData
import at.duk.services.AdminServices
import java.io.File

class CSVChecker(val project: ProjectData, val dataCacheDirectory: String, fileName: String) {
    val file = AdminServices.getProjectDataFolder(dataCacheDirectory, project.id).resolve(fileName)
    fun checkStructure(minCols: Int, maxCols: Int, colList: List<Pair<String, String>>): Pair<Boolean, List<String>> {
        var rc = true
        val report = mutableListOf<String>()

        if (!file.exists()) {
            report.add("Datei ${file.name} nicht vorhanden!")
            return Pair(false, report)
        }

        val content = file.readLines()
        report += "Analysierte Zeilen: ${content.size}"
        val mapFieldIndices = mutableMapOf<String, Int>()
        content.forEachIndexed { idx, str ->
            val arr = str.split(";")
            if (rc && (arr.size < minCols || arr.size > maxCols)) {
                rc = false
                report.add("Die Anzahl der Spalten in Zeile: $idx ist nicht korrekt (Min: $minCols, Max: $maxCols)!")
            }
            if (idx == 0) arr.forEachIndexed { ind, key -> mapFieldIndices[key] = ind }

            // check type
            if (idx > 0 && rc) {
                colList.forEach {
                    val index = mapFieldIndices[it.first]
                    val type = it.second
                    if (index != null && type == "INT") {
                        if (arr[index].toIntOrNull() == null) {
                            rc = false
                            report.add("Der Spaltentyp [\"$type\"] in Zeile: $idx / Spalte $index ist nicht korrekt!")
                            return@forEach
                        }
                    }
                }
            }
            if (!rc) return@forEachIndexed
        }

        return Pair(rc, report)
    }
}