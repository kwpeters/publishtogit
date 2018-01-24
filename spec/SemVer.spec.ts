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


        describe("sort()", () => {


            it("will sort an array of SemVer instances", () => {
                const semvers: Array<SemVer> = [
                    SemVer.fromString("3.3.1")!,
                    SemVer.fromString("3.3.3")!,
                    SemVer.fromString("3.3.2")!,

                    SemVer.fromString("3.2.1")!,
                    SemVer.fromString("3.2.3")!,
                    SemVer.fromString("3.2.2")!,

                    SemVer.fromString("3.1.1")!,
                    SemVer.fromString("3.1.3")!,
                    SemVer.fromString("3.1.2")!,

                    SemVer.fromString("2.3.1")!,
                    SemVer.fromString("2.3.3")!,
                    SemVer.fromString("2.3.2")!,

                    SemVer.fromString("2.2.1")!,
                    SemVer.fromString("2.2.3")!,
                    SemVer.fromString("2.2.2")!,

                    SemVer.fromString("2.1.1")!,
                    SemVer.fromString("2.1.3")!,
                    SemVer.fromString("2.1.2")!,

                    SemVer.fromString("1.3.1")!,
                    SemVer.fromString("1.3.3")!,
                    SemVer.fromString("1.3.2")!,

                    SemVer.fromString("1.2.1")!,
                    SemVer.fromString("1.2.3")!,
                    SemVer.fromString("1.2.2")!,

                    SemVer.fromString("1.1.1")!,
                    SemVer.fromString("1.1.3")!,
                    SemVer.fromString("1.1.2")!
                ];

                const sorted = SemVer.sort(semvers);
                let idx: number = 0;

                expect(sorted[idx++].toString()).toEqual("1.1.1");
                expect(sorted[idx++].toString()).toEqual("1.1.2");
                expect(sorted[idx++].toString()).toEqual("1.1.3");
                expect(sorted[idx++].toString()).toEqual("1.2.1");
                expect(sorted[idx++].toString()).toEqual("1.2.2");
                expect(sorted[idx++].toString()).toEqual("1.2.3");
                expect(sorted[idx++].toString()).toEqual("1.3.1");
                expect(sorted[idx++].toString()).toEqual("1.3.2");
                expect(sorted[idx++].toString()).toEqual("1.3.3");

                expect(sorted[idx++].toString()).toEqual("2.1.1");
                expect(sorted[idx++].toString()).toEqual("2.1.2");
                expect(sorted[idx++].toString()).toEqual("2.1.3");
                expect(sorted[idx++].toString()).toEqual("2.2.1");
                expect(sorted[idx++].toString()).toEqual("2.2.2");
                expect(sorted[idx++].toString()).toEqual("2.2.3");
                expect(sorted[idx++].toString()).toEqual("2.3.1");
                expect(sorted[idx++].toString()).toEqual("2.3.2");
                expect(sorted[idx++].toString()).toEqual("2.3.3");

                expect(sorted[idx++].toString()).toEqual("3.1.1");
                expect(sorted[idx++].toString()).toEqual("3.1.2");
                expect(sorted[idx++].toString()).toEqual("3.1.3");
                expect(sorted[idx++].toString()).toEqual("3.2.1");
                expect(sorted[idx++].toString()).toEqual("3.2.2");
                expect(sorted[idx++].toString()).toEqual("3.2.3");
                expect(sorted[idx++].toString()).toEqual("3.3.1");
                expect(sorted[idx++].toString()).toEqual("3.3.2");
                expect(sorted[idx++].toString()).toEqual("3.3.3");
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


        it("toString()", () => {
            const semver = SemVer.fromString("1.2.3");
            expect(semver!.getPatchVersionString()).toEqual("1.2.3");
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


        describe("compare()", () => {


            it("will return 0 when the two SemVers are equal", () => {
                const semver1 = SemVer.fromString("1.2.3");
                const semver2 = SemVer.fromString("1.2.3");
                expect(semver1!.compare(semver2!)).toEqual(0);
            });


            it("will return -1 when the first SemVer has a lower major number", () => {
                const semver1 = SemVer.fromString("1.2.2");
                const semver2 = SemVer.fromString("2.1.1");
                expect(semver1!.compare(semver2!)).toEqual(-1);
            });


            it("will return -1 when major numbers are equal and the first has a lower minor number", () => {
                const semver1 = SemVer.fromString("2.1.2");
                const semver2 = SemVer.fromString("2.2.1");
                expect(semver1!.compare(semver2!)).toEqual(-1);
            });


            it("will return -1 when major and minor numbers are equal and the first has a lower patch number", () => {
                const semver1 = SemVer.fromString("2.2.1");
                const semver2 = SemVer.fromString("2.2.2");
                expect(semver1!.compare(semver2!)).toEqual(-1);
            });


            it("will return 1 when the first has a higher major number", () => {
                const semver1 = SemVer.fromString("2.1.1");
                const semver2 = SemVer.fromString("1.2.2");
                expect(semver1!.compare(semver2!)).toEqual(1);
            });


            it("will return 1 when major numbers are equal and the first has a higher minor number", () => {
                const semver1 = SemVer.fromString("2.2.1");
                const semver2 = SemVer.fromString("2.1.2");
                expect(semver1!.compare(semver2!)).toEqual(1);
            });


            it("will return 1 when major and minor numbers are equal and the first has a higher patch number", () => {
                const semver1 = SemVer.fromString("2.2.2");
                const semver2 = SemVer.fromString("2.2.1");
                expect(semver1!.compare(semver2!)).toEqual(1);
            });


        });


    });


});
