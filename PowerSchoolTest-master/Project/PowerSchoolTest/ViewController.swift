//
//  ViewController.swift
//  PowerSchoolTest
//
//  Created by Chang-Chi Huang (student LM) on 1/11/19.
//  Copyright © 2019 Chang-Chi Huang (student LM). All rights reserved.
//

import UIKit
import JavaScriptCore

class ViewController: UIViewController {

    @IBOutlet weak var Username: UITextField!
    @IBOutlet weak var Password: UITextField!
    
    @IBAction func login(_ sender: UIButton) {
        let username = Username.text
        let password = Password.text
        PowerSchoolTest.login(username: username!, password: password!) { (_ result: [String]) in
            print(result)
        }
        if true {
            self.performSegue(withIdentifier: "toHome", sender: self)
        }
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
        PowerSchoolTest.login(username: , password: ) { (_ result: [String]) in
            print(result)
        }
    }


}

