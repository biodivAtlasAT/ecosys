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
package at.duk.utils

import at.duk.models.biotop.ProjectData
import at.duk.services.AdminServices

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
