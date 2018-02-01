import {Url} from "../src/url";


describe("Url", () => {


    describe("static", () => {


        describe("setProtocol()", () => {


            it("will change the protocol in the specified URL", () => {

                expect(Url.setProtocol("https://github.com/kwpeters/sampleGitRepo.git", "git+https"))
                .toEqual("git+https://github.com/kwpeters/sampleGitRepo.git");

            });


        });


    });


});
