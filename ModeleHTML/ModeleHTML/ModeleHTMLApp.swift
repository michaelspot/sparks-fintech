//
//  ModeleHTMLApp.swift
//  ModeleHTML
//
//  Created by Charly Klopfenstein on 22/07/2025.
//

import SwiftUI

@main
struct ModeleHTMLApp: App {
    var body: some Scene {
        DocumentGroup(newDocument: ModeleHTMLDocument()) { file in
            ContentView(document: file.$document)
        }
    }
}
