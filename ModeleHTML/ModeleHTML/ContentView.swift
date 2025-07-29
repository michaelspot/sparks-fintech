//
//  ContentView.swift
//  ModeleHTML
//
//  Created by Charly Klopfenstein on 22/07/2025.
//

import SwiftUI

struct ContentView: View {
    @Binding var document: ModeleHTMLDocument

    var body: some View {
        TextEditor(text: $document.text)
    }
}

#Preview {
    ContentView(document: .constant(ModeleHTMLDocument()))
}
