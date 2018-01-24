import {SemVer} from "../src/SemVer";


describe("SemVer", () => {


    describe("static", () => {


        describe("fromString()", () => {


            it("will return a SemVer instance when given a valid string", () => {
                const semver = SemVer.fromString("1.2.3");
                expect(semver).toBeTruthy();
            });


            it("will return undefined when given an invalid string", () => {
                expect(SemVer.fromString("1.2.A")).toEqual(undefined);
                expect(SemVer.fromString("1.2.3.4")).toEqual(undefined);
                expect(SemVer.fromString("1.2")).toEqual(undefined);
            });


        });


    });


    describe("instance", () => {


        it("major, minor and patch properties will return the expected version", () => {
            const semver = SemVer.fromString("1.2.3");
            expect(semver).toBeTruthy();
            expect(semver!.major).toEqual(1);
            expect(semver!.minor).toEqual(2);
            expect(semver!.patch).toEqual(3);
        });


        it("getMajorVersionString()", () => {
            const semver = SemVer.fromString("1.2.3");
            expect(semver!.getMajorVersionString()).toEqual("1");
        });


        it("getMinorVersionString()", () => {
            const semver = SemVer.fromString("1.2.3");
            expect(semver!.getMinorVersionString()).toEqual("1.2");
        });


        it("getPatchVersionString()", () => {
            const semver = SemVer.fromString("1.2.3");
            expect(semver!.getPatchVersionString()).toEqual("1.2.3");
        });


    });


});
