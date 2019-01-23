//
//  TestFile.swift
//  PowerSchoolTest
//
//  Created by Aidan Barr Bono (student LM) on 1/17/19.
//  Copyright © 2019 Chang-Chi Huang (student LM). All rights reserved.
//

import Foundation
import JavaScriptCore

var context: JSContext? = {
    let context = JSContext()
    
    // 1
    guard let   // create path variable for the file
        commonJSPath = Bundle.main.path(forResource: "test", ofType: "js", inDirectory: "./js") else {
            print("Unable to read resource files.")
            return nil
    }
    
    // 2
    do {
        // create variable for the files contents, as a string
        let common = try String(contentsOfFile: commonJSPath, encoding: String.Encoding.utf8)
        // evaluate the script
        _ = context?.evaluateScript(common)
    } catch (let error) {
        print("Error while processing script file: \(error)")
    }
    
    return context
}()

func run() {

    let testFunc = context?.objectForKeyedSubscript("x")
    let result = testFunc?.call(withArguments: [7]) as Any
    print(result)
}
